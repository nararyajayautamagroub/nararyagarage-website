import {getTutorials} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function TutorialsPage(){
  const tutorials=await getTutorials();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">TUTORIALS</h1>
    <p className="mt-3 text-zinc-400">Panduan BUSSID, ETS2, ATS, modding, livery, 3D, convoy, instalasi dan troubleshooting.</p>
    {tutorials.length?<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tutorials.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6"><p className="text-xs font-bold uppercase tracking-widest text-orange-400">{item.category}</p><h2 className="mt-2 font-bold">{item.title}</h2><p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-500">{item.body}</p><p className="mt-4 text-xs text-zinc-600">{item.author} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</p></article>)}</div>:<p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada tutorial yang dipublikasikan.</p>}
  </main>;
}