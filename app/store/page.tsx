"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Trash2, Clock3, QrCode, MessageCircle, Bot, RefreshCw } from "lucide-react";

type Product = { id: string; name: string; description: string; price: number; category: string };
type Order = { transactionId: string; amount: number; status: string; expiresAt: string; qrCodeUrl?: string | null; paymentUrl?: string | null; whatsappNumber?: string | null };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("Halo! Saya asisten Nararya Garage. Tanya soal produk, harga, atau pembayaran.");
  const [assistantBusy, setAssistantBusy] = useState(false);

  useEffect(() => {
    fetch("/api/store/products", { cache: "no-store" }).then(async r => { if (!r.ok) throw new Error("Katalog gagal dimuat."); return r.json(); }).then(d => setProducts(d.products)).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  const total = useMemo(() => products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0), [products, cart]);
  useEffect(() => {
    if (!order) return;
    const tick = () => setSeconds(Math.max(0, Math.ceil((new Date(order.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    const poll = setInterval(async () => {
      try { const r = await fetch("/api/store/orders/" + encodeURIComponent(order.transactionId), { cache: "no-store" }); if (r.ok) { const d = await r.json(); setOrder(old => old ? { ...old, status: d.status } : old); } } catch {}
    }, 5000);
    return () => { clearInterval(timer); clearInterval(poll); };
  }, [order?.transactionId, order?.expiresAt]);
  const add = (id: string, delta: number) => setCart(old => { const next = Math.max(0, Math.min(20, (old[id] || 0) + delta)); const copy = { ...old }; if (next) copy[id] = next; else delete copy[id]; return copy; });

  async function checkout(e: FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/store/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: name, customerWhatsapp: phone, customerEmail: email || undefined, items: Object.entries(cart).map(([id, quantity]) => ({ id, quantity })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout gagal.");
      setOrder(data); setSeconds(Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 1000)));
    } catch (e) { setError(e instanceof Error ? e.message : "Checkout gagal."); } finally { setBusy(false); }
  }
  async function askAssistant(e: React.FormEvent) {
    e.preventDefault(); if (!assistantInput.trim()) return;
    setAssistantBusy(true);
    try { const r = await fetch("/api/store/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: assistantInput }) }); const d = await r.json(); setAssistantAnswer(d.answer || d.error || "Asisten belum bisa menjawab."); setAssistantInput(""); }
    catch { setAssistantAnswer("Asisten sedang tidak bisa dihubungi. Coba lagi."); } finally { setAssistantBusy(false); }
  }
  const waNumber = order?.whatsappNumber || "";
  const waMessage = order ? encodeURIComponent(`Halo Nararya Garage, saya ingin konfirmasi pesanan. ID transaksi: ${order.transactionId}. Total: ${money(order.amount)}. Status saat ini: ${order.status}. Mohon bantu verifikasi pembayaran.`) : "";
  const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${waMessage}` : `https://wa.me/?text=${waMessage}`;

  return <main className="min-h-screen bg-zinc-950 text-white">
    <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(249,115,22,.17),transparent_38%)]">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <Link href="/" className="text-sm font-semibold text-orange-300">← Kembali ke NARARYA GARAGE</Link>
        <p className="mt-8 text-xs font-bold tracking-[.28em] text-orange-300">OFFICIAL STORE</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Garage Store<span className="text-orange-400">.</span></h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Pilih jasa desain dan modding, masukkan ke keranjang, lalu checkout. ID transaksi dan batas pembayaran dibuat otomatis.</p>
      </div>
    </section>
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.4fr_.8fr] md:px-8">
      <section>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-extrabold">Katalog produk</h2><span className="text-sm text-zinc-500">Data diperbarui langsung dari API</span></div>
        {loading ? <p className="rounded-xl border border-white/10 p-6 text-zinc-400">Memuat katalog…</p> : <div className="grid gap-4 sm:grid-cols-2">{products.map(p => <article key={p.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-300">{p.category}</span><h3 className="mt-3 text-lg font-bold">{p.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{p.description}</p><p className="mt-5 text-xl font-black">{money(p.price)}</p>
          <div className="mt-4 flex items-center gap-3"><button onClick={() => add(p.id, -1)} className="rounded-lg border border-white/15 p-2" aria-label="Kurangi jumlah"><Minus size={16}/></button><span className="min-w-5 text-center font-bold">{cart[p.id] || 0}</span><button onClick={() => add(p.id, 1)} className="rounded-lg border border-white/15 p-2" aria-label="Tambah jumlah"><Plus size={16}/></button><button onClick={() => add(p.id, 1)} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-black hover:bg-orange-400"><ShoppingCart size={16}/> Tambah</button></div>
        </article>)}</div>}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="flex items-center gap-3"><span className="rounded-xl bg-orange-500/15 p-3 text-orange-300"><Bot/></span><div><h2 className="font-extrabold">AI Store Assistant</h2><p className="text-xs text-zinc-500">Bantuan katalog dan pembayaran</p></div></div><p className="mt-4 rounded-xl bg-black/30 p-4 text-sm leading-6 text-zinc-300">{assistantAnswer}</p><form onSubmit={askAssistant} className="mt-3 flex gap-2"><input value={assistantInput} onChange={e=>setAssistantInput(e.target.value)} maxLength={1500} placeholder="Contoh: berapa harga livery?" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange-400"/><button disabled={assistantBusy} className="rounded-xl bg-orange-500 px-4 font-bold text-black disabled:opacity-50">{assistantBusy ? "…" : "Kirim"}</button></form></section>
      </section>
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/[.03] p-5 md:sticky md:top-5">
        {!order ? <>
          <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Keranjang</h2><ShoppingCart className="text-orange-300"/></div>
          <div className="mt-5 space-y-3">{products.filter(p=>cart[p.id]).map(p=><div key={p.id} className="flex gap-3 border-b border-white/10 pb-3"><div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-sm text-zinc-500">{cart[p.id]} × {money(p.price)}</p></div><button onClick={()=>add(p.id,-(cart[p.id]||0))} className="text-zinc-500 hover:text-red-300" aria-label="Hapus dari keranjang"><Trash2 size={17}/></button></div>)}
          {!Object.keys(cart).length && <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-500">Keranjang masih kosong. Pilih produk dulu, dompet belum akan diserang.</p>}</div>
          <div className="mt-5 flex justify-between text-lg font-black"><span>Total</span><span>{money(total)}</span></div>
          <form onSubmit={checkout} className="mt-6 space-y-3"><label className="block text-sm text-zinc-300">Nama pemesan<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 outline-none focus:border-orange-400" placeholder="Nama lengkap"/></label><label className="block text-sm text-zinc-300">Nomor WhatsApp<input required value={phone} onChange={e=>setPhone(e.target.value)} maxLength={20} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 outline-none focus:border-orange-400" placeholder="08xx atau +62xx"/></label><label className="block text-sm text-zinc-300">Email (opsional)<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 outline-none focus:border-orange-400" placeholder="email@contoh.com"/></label><button disabled={!total||busy||loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-black text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"><QrCode size={18}/>{busy ? "Membuat transaksi…" : "Checkout dengan QRIS"}</button><p className="text-xs leading-5 text-zinc-500">Batas pembayaran 10 menit sejak transaksi dibuat. Jangan transfer sebelum QRIS resmi muncul.</p></form>
        </> : <><div className="flex items-center gap-2"><QrCode className="text-orange-300"/><h2 className="text-xl font-extrabold">Pembayaran</h2></div><p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">ID transaksi</p><p className="mt-1 break-all text-lg font-black text-orange-300">{order.transactionId}</p><div className="mt-4 flex items-center justify-between"><span className="text-zinc-400">Total tagihan</span><strong className="text-xl">{money(order.amount)}</strong></div><div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-400/10 p-4"><div className="flex items-center gap-2 text-orange-200"><Clock3 size={18}/><span className="font-bold">{order.status === "PENDING" ? `${Math.floor(seconds/60).toString().padStart(2,"0")}:${(seconds%60).toString().padStart(2,"0")} tersisa` : order.status}</span></div><p className="mt-1 text-xs text-zinc-400">Batas: {new Date(order.expiresAt).toLocaleString("id-ID")}</p></div>
          {order.status === "PENDING" && seconds > 0 ? <>{order.qrCodeUrl ? <Image unoptimized width={320} height={320} src={order.qrCodeUrl} alt="QRIS pembayaran transaksi" className="mx-auto mt-5 w-full max-w-xs rounded-xl bg-white p-3"/> : <div className="mt-5 rounded-xl border border-white/10 p-4 text-sm text-zinc-400">QRIS belum tersedia. Buka halaman pembayaran gateway jika tersedia.</div>}{order.paymentUrl && <a href={order.paymentUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-xl border border-white/15 px-4 py-3 text-center font-bold hover:bg-white/5">Buka halaman pembayaran</a>}<p className="mt-3 text-center text-xs text-zinc-500">Status diperiksa otomatis setiap 5 detik.</p></> : <div className="mt-5 rounded-xl border border-white/10 p-4 text-sm">Status transaksi: <strong>{order.status}</strong>{order.status==="EXPIRED"&&" · Buat pesanan baru untuk mendapatkan QRIS baru."}{order.status==="PAID"&&" · Pembayaran telah dikonfirmasi oleh gateway."}</div>}
          <a href={waLink} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-bold text-black hover:bg-green-400"><MessageCircle size={18}/> Konfirmasi via WhatsApp</a><button onClick={()=>{setOrder(null);setCart({});setError("");}} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-bold hover:bg-white/5"><RefreshCw size={16}/> Kembali ke toko</button>
        </>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      </aside>
    </div>
    <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-zinc-600">NARARYA GARAGE · Transaksi dan pembayaran diverifikasi melalui server. Jangan bagikan kode rahasia atau OTP.</footer>
  </main>;
}
