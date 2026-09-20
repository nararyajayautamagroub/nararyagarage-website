import Link from "next/link";
import {redirect} from "next/navigation";
import {getCurrentMember} from "@/lib/member";

export const dynamic="force-dynamic";

export default async function Dashboard(){
  const current=await getCurrentMember();
  if(!current)redirect("/login?next=/member/dashboard");
  if(!current.prisma||!current.member)return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-zinc-500">Member database belum terhubung.</p></main>;

  const [events,convoys,showcase,achievements,notifications,submissions]=await Promise.all([
    current.prisma.eventParticipant.count({where:{memberId:current.member.id,status:{not:"CANCELLED"}}}),
    current.prisma.eventParticipant.count({where:{memberId:current.member.id,event:{type:{contains:"convoy",mode:"insensitive"}},status:{not:"CANCELLED"}}}),
    current.prisma.showcase.count({where:{author:current.session.user.username}}),
    current.prisma.memberAchievement.count({where:{memberId:current.member.id}}),
    current.prisma.notification.count({where:{memberId:current.member.id,readAt:null}}),
    current.prisma.mod.count({where:{author:current.session.user.username}})
  ]);

  const cards:Array<[string,number,string]>=[
    ["Events",events,"/member/events"],
    ["Convoys",convoys,"/member/convoys"],
    ["Showcase",showcase,"/member/showcase"],
    ["Achievements",achievements,"/member/achievements"],
    ["Unread",notifications,"/member/notifications"],
    ["Mod submissions",submissions,"/member/submissions"]
  ];

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER CENTER</p>
    <h1 className="mt-2 text-4xl font-black">Dashboard</h1>
    <p className="mt-3 text-zinc-400">Halo {current.session.user.displayName}, semua angka di sini berasal dari database komunitas.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label,value,href])=><Link href={href} key={label} className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:border-orange-500/40 hover:bg-orange-500/5"><p className="text-xs font-bold uppercase tracking-widest text-zinc-600">{label}</p><p className="mt-3 text-4xl font-black text-orange-400">{value}</p></Link>)}</div>
    <div className="mt-8 grid gap-4 md:grid-cols-2"><Link href="/submit" className="ng-orange-button">SUBMIT KARYA</Link><Link href="/member/profile" className="ng-orange-outline">EDIT PROFILE</Link></div>
  </main>;
}