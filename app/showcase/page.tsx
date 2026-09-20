import {getShowcases} from "@/lib/data";
import {SectionTitle} from "@/components/cards";

export const dynamic="force-dynamic";

export default async function Showcase(){
  const items=await getShowcases();
  return <main className="mx-auto max-w-7xl px-6 py-20">
    <SectionTitle eyebrow="Creator showcase" title="Fleet, mods, livery & 3D" desc="Ruang publik untuk karya komunitas, lengkap dengan author, credits dan license."/>
    {items.length?<div className="grid gap-4 md:grid-cols-2">{items.map(item=><article key={item.id} className="min-h-52 rounded-2xl border border-white/10 bg-white/[.03] p-7">
      <span className="text-xs font-bold uppercase tracking-widest text-orange-400">{item.type}</span>
      <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
      <p className="mt-2 text-sm text-zinc-500">Author: {item.author}</p>
      <p className="mt-3 max-w-xl text-zinc-400">{item.description||"Tidak ada deskripsi."}</p>
      <p className="mt-4 text-xs text-zinc-600">{item.credits||"Credits belum diisi"} · {item.license||"License belum diisi"}</p>
    </article>)}</div>:<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada showcase yang dipublikasikan.</p>}
  </main>;
}