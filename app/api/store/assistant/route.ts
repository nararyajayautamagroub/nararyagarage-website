import { NextRequest, NextResponse } from "next/server";
import { STORE_PRODUCTS } from "../products/route";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Pesan tidak valid." }, { status: 400 }); }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1500) : "";
  if (!message) return NextResponse.json({ error: "Tulis pertanyaan dulu." }, { status: 400 });
  const endpoint = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  if (endpoint && apiKey) {
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o-mini", messages: [{ role: "system", content: "Kamu adalah asisten layanan Nararya Garage. Jawab dalam Bahasa Indonesia, jujur tentang harga dan fitur. Jangan mengarang status pembayaran. Katalog resmi: " + JSON.stringify(STORE_PRODUCTS) }, { role: "user", content: message }] }), cache: "no-store", signal: AbortSignal.timeout(15000) });
      const data: any = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      if (response.ok && typeof answer === "string") return NextResponse.json({ answer, mode: "ai", generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
    } catch { /* Use safe local fallback below. */ }
  }
  const q = message.toLowerCase();
  let answer = "Saya asisten Nararya Garage. Saya bisa bantu soal katalog, harga, pemesanan, QRIS, dan status transaksi. Untuk jawaban AI generatif, admin perlu mengatur AI_API_URL dan AI_API_KEY.";
  if (/harga|produk|katalog|beli/.test(q)) answer = "Katalog saat ini: " + STORE_PRODUCTS.map(p => `${p.name} Rp${p.price.toLocaleString("id-ID")}`).join("; ") + ". Pilih produk lalu masukkan ke keranjang untuk mulai checkout.";
  else if (/qris|bayar|pembayaran/.test(q)) answer = "Checkout membuat ID transaksi dan batas pembayaran 10 menit. QRIS live memerlukan konfigurasi MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION, dan webhook Midtrans.";
  else if (/whatsapp|wa/.test(q)) answer = "Masukkan nomor WhatsApp aktif saat checkout. Setelah transaksi dibuat, halaman akan menyiapkan pesan konfirmasi berisi ID transaksi dan nominal.";
  return NextResponse.json({ answer, mode: "fallback", generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
