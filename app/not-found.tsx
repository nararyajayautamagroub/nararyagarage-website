import Link from "next/link";

export default function NotFound(){
  return <main className="grid min-h-[70vh] place-items-center px-6 py-20">
    <div className="max-w-lg text-center">
      <p className="text-sm font-black tracking-[.25em] text-orange-400">404</p>
      <h1 className="mt-3 text-4xl font-black">Halaman tidak ditemukan.</h1>
      <p className="mt-4 text-zinc-400">Rute ini belum ada, sudah dipindah, atau manusia kembali membuat URL yang typo.</p>
      <Link href="/" className="mt-7 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-400">Kembali ke beranda</Link>
    </div>
  </main>;
}