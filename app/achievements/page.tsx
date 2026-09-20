import {getAchievements} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function AchievementsPage(){
  const achievements=await getAchievements();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <p className="text-xs font-bold tracking-[.25em] text-orange-400">COMMUNITY PROGRESS</p>
    <h1 className="mt-2 text-4xl font-black">ACHIEVEMENTS</h1>
    <p className="mt-3 max-w-2xl text-zinc-400">Pencapaian member yang benar-benar tersimpan di database komunitas.</p>
    {achievements.length ? (
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map(item=><article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">{item.code}</p>
          <h2 className="mt-2 text-xl font-black">{item.name}</h2>
          <p className="mt-3 text-zinc-400">{item.description}</p>
          <p className="mt-5 text-xs text-zinc-600">{item._count.memberAchievements} member meraih</p>
        </article>)}
      </div>
    ) : <p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada achievement.</p>}
  </main>;
}