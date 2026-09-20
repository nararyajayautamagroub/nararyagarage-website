import {redirect} from "next/navigation";
import Link from "next/link";
import {getCurrentMember} from "@/lib/member";

export const dynamic="force-dynamic";

export default async function MemberShowcase(){
  const current=await getCurrentMember();
  if(!current)redirect("/login?next=/member/showcase");
  if(!current.prisma||!current.member)return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-zinc-500">Member database belum terhubung.</p></main>;

  const [mods,liveries,showcases]=await Promise.all([
    current.prisma.mod.count({where:{author:current.session.user.username}}),
    current.prisma.livery.count({where:{author:current.session.user.username}}),
    current.prisma.showcase.count({where:{author:current.session.user.username}})
  ]);

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · SHOWCASE</p><h1 className="mt-2 text-4xl font-black">My Showcase</h1><p className="mt-3 text-zinc-400">Jumlah karya yang tercatat memakai username akunmu.</p></div><Link href="/submit" className="ng-orange-button">SUBMIT KARYA</Link></div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">{[["Mods",mods],["Liveries",liveries],["Showcase",showcases]].map(([label,value])=><article key={label} className="rounded-2xl border border-white/10 bg-zinc-950 p-6"><p className="text-xs font-bold uppercase tracking-widest text-zinc-600">{label}</p><p className="mt-3 text-4xl font-black text-orange-400">{value}</p></article>)}</div>
  </main>;
}