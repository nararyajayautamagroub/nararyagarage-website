import {SectionTitle} from "@/components/cards";
import {getForumCategories} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function Forum(){
  const categories=await getForumCategories();
  return <main className="mx-auto max-w-7xl px-6 py-20">
    <SectionTitle eyebrow="Community discussion" title="Forum" desc="Thread dan reply komunitas dengan moderation, lock, pin dan report."/>
    {categories.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map(category=><div key={category.id} className="rounded-xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="font-bold">{category.name}</h2>
      <p className="mt-2 text-xs text-zinc-500">{category._count.threads} thread</p>
    </div>)}</div>:<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada kategori forum.</p>}
  </main>;
}