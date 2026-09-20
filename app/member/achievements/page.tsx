import {redirect} from "next/navigation";
import {getCurrentMember} from "@/lib/member";

export const dynamic="force-dynamic";

export default async function Achievements(){
  const current=await getCurrentMember();
  if(!current)redirect("/login?next=/member/achievements");
  if(!current.prisma||!current.member)return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-zinc-500">Member database belum terhubung.</p></main>;

  const rows=await current.prisma.memberAchievement.findMany({
    where:{memberId:current.member.id},
    orderBy:{earnedAt:"desc"},
    take:100,
    select:{earnedAt:true,achievement:{select:{code:true,name:true,description:true}}}
  });

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · ACHIEVEMENTS</p>
    <h1 className="mt-2 text-4xl font-black">My Achievements</h1>
    <p className="mt-3 text-zinc-400">Achievement yang benar-benar telah diperoleh akunmu.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.length?rows.map(row=><article key={row.achievement.code} className="rounded-2xl border border-orange-500/20 bg-zinc-950 p-6"><p className="text-xs font-bold tracking-widest text-orange-400">{row.achievement.code}</p><h2 className="mt-2 font-black">{row.achievement.name}</h2><p className="mt-3 text-sm text-zinc-400">{row.achievement.description}</p><p className="mt-5 text-xs text-zinc-600">{new Date(row.earnedAt).toLocaleDateString("id-ID")}</p></article>):<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada achievement.</p>}</div>
  </main>;
}