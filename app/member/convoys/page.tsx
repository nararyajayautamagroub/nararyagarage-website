import Link from "next/link";
import {redirect} from "next/navigation";
import {getCurrentMember} from "@/lib/member";

export const dynamic="force-dynamic";

export default async function MemberConvoys(){
  const current=await getCurrentMember();
  if(!current)redirect("/login?next=/member/convoys");
  if(!current.prisma||!current.member)return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-zinc-500">Member database belum terhubung.</p></main>;

  const rows=await current.prisma.eventParticipant.findMany({
    where:{memberId:current.member.id,event:{type:{contains:"convoy",mode:"insensitive"}}},
    orderBy:{registeredAt:"desc"},
    take:100,
    select:{eventId:true,status:true,role:true,registeredAt:true,event:{select:{name:true,date:true,status:true,route:true,meetingPoint:true,game:true}}}
  });

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · CONVOYS</p><h1 className="mt-2 text-4xl font-black">My Convoys</h1><p className="mt-3 text-zinc-400">Riwayat convoy, role, route, meeting point dan attendance.</p></div><Link href="/convoy" className="ng-orange-button">CONVOY CENTER</Link></div>
    <div className="mt-8 space-y-3">{rows.length?rows.map(row=><article key={row.eventId} className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">{row.event.name}</h2><p className="mt-1 text-sm text-zinc-500">{row.event.game||"Community"} · {row.event.date.toLocaleString("id-ID")}</p><p className="mt-2 text-xs text-zinc-600">Route: {row.event.route||"Belum ditentukan"} · Meeting: {row.event.meetingPoint||"Belum ditentukan"}</p></div><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">{row.status}</span></div><p className="mt-3 text-xs text-zinc-500">Role: {row.role||"Participant"}</p></article>):<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada convoy yang kamu ikuti.</p>}</div>
  </main>;
}