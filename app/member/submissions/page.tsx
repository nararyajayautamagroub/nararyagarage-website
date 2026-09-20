import {redirect} from "next/navigation";
import {getCurrentMember} from "@/lib/member";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function Submissions(){
  const current=await getCurrentMember();
  if(!current)redirect("/login?next=/member/submissions");
  if(!current.prisma||!current.member)return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-zinc-500">Member database belum terhubung.</p></main>;

  const [mods,liveries,showcases]=await Promise.all([
    current.prisma.mod.findMany({where:{author:current.session.user.username},orderBy:{createdAt:"desc"},take:50,select:{id:true,name:true,status:true,createdAt:true}}),
    current.prisma.livery.findMany({where:{author:current.session.user.username},orderBy:{createdAt:"desc"},take:50,select:{id:true,name:true,createdAt:true}}),
    current.prisma.showcase.findMany({where:{author:current.session.user.username},orderBy:{createdAt:"desc"},take:50,select:{id:true,title:true,type:true,createdAt:true}})
  ]);

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · SUBMISSIONS</p><h1 className="mt-2 text-4xl font-black">My Submissions</h1><p className="mt-3 text-zinc-400">Pantau karya yang kamu kirim ke komunitas.</p></div><Link href="/submit" className="ng-orange-button">SUBMIT BARU</Link></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6"><h2 className="text-xl font-black">Mods</h2><div className="mt-4 space-y-2">{mods.length?mods.map(item=><div key={item.id} className="rounded-xl border border-white/10 p-4"><p className="font-bold">{item.name}</p><p className="mt-1 text-xs text-zinc-600">{item.status} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</p></div>):<p className="text-sm text-zinc-600">Belum ada mod.</p>}</div></section>
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6"><h2 className="text-xl font-black">Livery</h2><div className="mt-4 space-y-2">{liveries.length?liveries.map(item=><div key={item.id} className="rounded-xl border border-white/10 p-4"><p className="font-bold">{item.name}</p><p className="mt-1 text-xs text-zinc-600">{new Date(item.createdAt).toLocaleDateString("id-ID")}</p></div>):<p className="text-sm text-zinc-600">Belum ada livery.</p>}</div></section>
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6"><h2 className="text-xl font-black">Showcase</h2><div className="mt-4 space-y-2">{showcases.length?showcases.map(item=><div key={item.id} className="rounded-xl border border-white/10 p-4"><p className="font-bold">{item.title}</p><p className="mt-1 text-xs text-zinc-600">{item.type} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</p></div>):<p className="text-sm text-zinc-600">Belum ada showcase.</p>}</div></section>
    </div>
  </main>;
}