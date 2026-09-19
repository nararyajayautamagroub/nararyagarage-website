export default function Loading(){
  return <main className="grid min-h-[50vh] place-items-center px-6 py-16">
    <div className="rounded-2xl border border-white/10 bg-zinc-950 px-6 py-5 text-center shadow-xl">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      <p className="mt-4 text-sm font-semibold text-zinc-300">Memuat NARARYA GARAGE...</p>
    </div>
  </main>;
}