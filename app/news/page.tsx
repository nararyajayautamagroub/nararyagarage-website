import {getPublishedNews} from "@/lib/data";
import {SectionTitle} from "@/components/cards";

export const dynamic="force-dynamic";

export default async function News(){
  const items=await getPublishedNews();
  return <main className="mx-auto max-w-4xl px-6 py-20">
    <SectionTitle eyebrow="News & announcement" title="Community news" desc="Announcement, update, recruitment, event, modding dan maintenance."/>
    {items.length?<div className="space-y-4">{items.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">{item.type}</p>
      <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
      <p className="mt-1 text-xs text-zinc-600">{item.publishedAt?new Date(item.publishedAt).toLocaleString("id-ID"):""}</p>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-400">{item.body}</p>
    </article>)}</div>:<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada berita yang dipublikasikan.</p>}
  </main>;
}