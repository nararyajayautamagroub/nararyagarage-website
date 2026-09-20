import {getGalleryItems} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function GalleryPage(){
  const items=await getGalleryItems();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">GALLERY</h1>
    <p className="mt-3 text-zinc-400">Album convoy, event, vehicle, mod, livery, 3D, screenshot, dan video.</p>
    {items.length?<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-zinc-950 p-3 transition hover:border-orange-500/40 hover:bg-orange-500/5">
      <div className="aspect-video overflow-hidden rounded-xl bg-black"><img src={item.url} alt={item.album?.name||"Gallery item"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/></div>
      <p className="mt-3 text-sm font-bold">{item.album?.name||item.type}</p>
      <p className="mt-1 text-xs text-zinc-500">{item.author||"Unknown author"} · {item.type}</p>
    </a>)}</div>:<p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada item gallery.</p>}
  </main>;
}