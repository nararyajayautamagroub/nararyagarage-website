import {getLiveries} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function LiveriesPage(){
  const items=await getLiveries();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">LIVERY SHOWCASE</h1>
    <p className="mt-3 text-zinc-400">Koleksi livery bus, truck, car, community, company, dan custom.</p>
    {items.length?<div className="mt-10 grid gap-4 md:grid-cols-2">{items.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6"><h2 className="font-bold">{item.name}</h2><p className="mt-2 text-sm text-zinc-400">{item.vehicle} · {item.game||item.platform||"Community"}</p><p className="mt-2 text-sm text-zinc-500">Author: {item.author}</p><p className="mt-3 text-xs text-zinc-600">{item.credits||"Credits belum diisi"}</p>{item.screenshotUrl&&<a href={item.screenshotUrl} target="_blank" rel="noreferrer" className="ng-orange-outline mt-5 inline-flex">VIEW IMAGE</a>}</article>)}</div>:<p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada livery.</p>}
  </main>;
}