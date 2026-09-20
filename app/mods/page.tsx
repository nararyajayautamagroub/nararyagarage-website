import {getPublishedMods} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function ModsPage(){
  const items=await getPublishedMods();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">MOD SHOWCASE</h1>
    <p className="mt-3 text-zinc-400">Katalog mod, kodename, texture, animation, sound, dan tools yang sudah dipublikasikan.</p>
    {items.length?<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">{item.platform||item.game||"Community"}</p>
      <h2 className="mt-2 text-xl font-black">{item.name}</h2>
      <p className="mt-2 text-sm text-zinc-500">Author: {item.author}{item.version?" · v"+item.version:""}</p>
      <p className="mt-3 text-sm text-zinc-400">{item.description||"Tidak ada deskripsi."}</p>
      <p className="mt-4 text-xs text-zinc-600">{item.credits||"Credits belum diisi"} · {item.license||"License belum diisi"}</p>
      {item.downloadUrl&&<a href={item.downloadUrl} target="_blank" rel="noreferrer" className="ng-orange-button mt-5 inline-flex">DOWNLOAD</a>}
    </article>)}</div>:<p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada mod yang dipublikasikan.</p>}
  </main>;
}