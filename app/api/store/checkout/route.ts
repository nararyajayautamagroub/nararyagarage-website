import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { STORE_PRODUCTS } from "../products/route";

export const dynamic = "force-dynamic";
const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return jsonError("Format permintaan tidak valid.", 400); }
  const customerName = typeof body.customerName === "string" ? body.customerName.trim().slice(0, 100) : "";
  const customerWhatsapp = typeof body.customerWhatsapp === "string" ? body.customerWhatsapp.replace(/[^+\d]/g, "").slice(0, 20) : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().slice(0, 200) : null;
  const requested = Array.isArray(body.items) ? body.items : [];
  if (customerName.length < 2 || customerWhatsapp.replace(/\D/g, "").length < 9 || !requested.length || requested.length > 20) return jsonError("Isi nama, WhatsApp yang valid, dan minimal satu produk.", 400);

  const quantities = new Map<string, number>();
  for (const item of requested) {
    if (!item || typeof item.id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) return jsonError("Produk atau jumlah tidak valid.", 400);
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  }
  const items = [...quantities.entries()].map(([id, quantity]) => {
    const product = STORE_PRODUCTS.find(p => p.id === id);
    return product ? { id, name: product.name, price: product.price, quantity } : null;
  });
  if (items.some(item => !item)) return jsonError("Ada produk yang tidak ditemukan. Muat ulang katalog.", 400);
  const safeItems = items as { id: string; name: string; price: number; quantity: number }[];
  const amount = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(amount) || amount < 1000 || amount > 50_000_000) return jsonError("Total transaksi tidak valid.", 400);

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return jsonError("Pembayaran QRIS belum aktif di server. Admin perlu mengatur MIDTRANS_SERVER_KEY dan MIDTRANS_IS_PRODUCTION.", 503);
  const prisma = getPrisma();
  if (!prisma) return jsonError("Database belum dikonfigurasi. Transaksi belum dibuat.", 503);

  const transactionId = `NG-${new Date().toISOString().slice(2,10).replace(/-/g,"")}-${randomUUID().slice(0,8).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  let order: any;
  try {
    order = await prisma.storeOrder.create({ data: { transactionId, customerName, customerEmail, customerWhatsapp, items: safeItems, amount, expiresAt } });
  } catch { return jsonError("Gagal menyimpan transaksi. Coba lagi sebentar.", 503); }

  try {
    const base = process.env.MIDTRANS_IS_PRODUCTION === "true" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
    const response = await fetch(`${base}/v2/charge`, {
      method: "POST",
      headers: { "Authorization": `Basic ${Buffer.from(serverKey + ":").toString("base64")}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        payment_type: "qris",
        transaction_details: { order_id: transactionId, gross_amount: amount },
        item_details: safeItems.map(item => ({ id: item.id, price: item.price, quantity: item.quantity, name: item.name.slice(0, 50) })),
        customer_details: { first_name: customerName, email: customerEmail || undefined, phone: customerWhatsapp },
        qris: { acquirer: "gopay" },
        custom_expiry: { order_time: new Date().toISOString().replace("T", " ").slice(0, 19) + " +0000", expiry_duration: 10, unit: "minute" }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    const payment: any = await response.json();
    if (!response.ok) throw new Error(typeof payment.status_message === "string" ? payment.status_message : "Gateway pembayaran menolak transaksi.");
    const qr = Array.isArray(payment.actions) ? payment.actions.find((action: any) => action.name === "generate-qr-code")?.url : null;
    const updated = await prisma.storeOrder.update({ where: { id: order.id }, data: { qrCodeUrl: typeof qr === "string" ? qr : null, paymentUrl: typeof payment.redirect_url === "string" ? payment.redirect_url : null, providerOrderId: transactionId } });
    return NextResponse.json({ transactionId, amount, status: updated.status, expiresAt: updated.expiresAt.toISOString(), qrCodeUrl: updated.qrCodeUrl, paymentUrl: updated.paymentUrl, whatsappNumber: process.env.STORE_WHATSAPP_NUMBER || null }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await prisma.storeOrder.update({ where: { id: order.id }, data: { status: "FAILED" } }).catch(() => undefined);
    return jsonError(error instanceof Error ? error.message : "Gateway QRIS gagal dihubungi. Coba lagi.", 502);
  }
}
