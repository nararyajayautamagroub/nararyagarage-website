import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Catalog is server-owned so the browser cannot change product prices.
export const STORE_PRODUCTS = [
  { id: "livery-custom", name: "Livery Custom BUSSID", description: "Desain livery sesuai brief dan referensi pelanggan.", price: 25000, category: "Design" },
  { id: "logo-community", name: "Logo Komunitas", description: "Logo komunitas gaming atau simulator.", price: 15000, category: "Design" },
  { id: "poster-bus", name: "Poster Bus", description: "Poster promosi bus dengan detail pilihan pelanggan.", price: 20000, category: "Design" },
  { id: "texture-edit", name: "Edit Texture", description: "Jasa edit texture kendaraan simulator.", price: 25000, category: "Modding" },
  { id: "3d-consult", name: "Konsultasi 3D / Mod", description: "Sesi konsultasi kebutuhan asset dan mod.", price: 10000, category: "Service" },
] as const;

export async function GET() {
  return NextResponse.json({ products: STORE_PRODUCTS, currency: "IDR", generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
