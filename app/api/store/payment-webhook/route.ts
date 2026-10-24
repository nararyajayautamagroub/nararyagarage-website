import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return NextResponse.json({ error: "Webhook belum dikonfigurasi." }, { status: 503 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 }); }
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body ?? {};
  if (![order_id, status_code, gross_amount, signature_key, transaction_status].every(value => typeof value === "string")) return NextResponse.json({ error: "Payload tidak lengkap." }, { status: 400 });
  const expected = createHash("sha512").update(String(order_id) + String(status_code) + String(gross_amount) + serverKey).digest("hex");
  const a = Buffer.from(expected); const b = Buffer.from(signature_key);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "Signature tidak valid." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database belum tersedia." }, { status: 503 });
  const order = await prisma.storeOrder.findUnique({ where: { transactionId: order_id } });
  if (!order) return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
  if (Number(gross_amount) !== order.amount) return NextResponse.json({ error: "Nominal tidak cocok." }, { status: 400 });
  if (order.status === "PAID") return NextResponse.json({ received: true });
  if (transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept")) {
    await prisma.storeOrder.update({ where: { transactionId: order_id }, data: { status: "PAID", paidAt: new Date() } });
  } else if (["expire", "cancel", "deny"].includes(transaction_status)) {
    await prisma.storeOrder.update({ where: { transactionId: order_id }, data: { status: transaction_status === "expire" ? "EXPIRED" : transaction_status === "cancel" ? "CANCELLED" : "FAILED" } });
  }
  return NextResponse.json({ received: true });
}
