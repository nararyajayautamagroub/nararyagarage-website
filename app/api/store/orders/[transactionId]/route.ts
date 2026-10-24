import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, context: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await context.params;
  if (!/^NG-[A-Z0-9-]{8,40}$/.test(transactionId)) return NextResponse.json({ error: "ID transaksi tidak valid." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const order = await prisma.storeOrder.findUnique({ where: { transactionId }, select: { transactionId: true, amount: true, status: true, expiresAt: true, paidAt: true, qrCodeUrl: true, paymentUrl: true, createdAt: true } });
  if (!order) return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
  let status = order.status;
  if (status === "PENDING" && order.expiresAt.getTime() <= Date.now()) {
    await prisma.storeOrder.update({ where: { transactionId }, data: { status: "EXPIRED" } }).catch(() => undefined);
    status = "EXPIRED";
  }
  return NextResponse.json({ ...order, status, expiresAt: order.expiresAt.toISOString(), paidAt: order.paidAt?.toISOString() ?? null, serverTime: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
