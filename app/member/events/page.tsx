import Link from "next/link";
import {redirect} from "next/navigation";
import {getCurrentMember} from "@/lib/member";

export const dynamic="force-dynamic";

export default async function MemberEvents(){
  const current=await getCurrentMember();
  if(!current)redirect("/login?next=/member/events");
  if(!current.prisma||!current.member)return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-zinc-500">Member database belum terhubung.</p></main>;

  const rows=await current.prisma.eventParticipant.findMany({
    where:{memberId:current.member.id},
    orderBy:{registeredAt:"desc"},
    take:100,
    select:{eventId:true,status:true,registeredAt:true,event:{select:{name:true,type:true,date:true,status:true,eventId:true,game:true,route:true}}}
  });

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · EVENTS</p><h1 className="mt-2 text-4xl font-black">My Events</h1><p className="mt-3 text-zinc-400">Event yang kamu daftarkan dan status kehadiran.</p></div><Link href="/events" className="ng-orange-button">CARI EVENT</Link></div>
    <div className="mt-8 space-y-3">{rows.length?rows.map(row=><article key={row.eventId} className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="font-bold">{row.event.name}</h2><p className="mt-1 text-sm text-zinc-500">{row.event.type} · {row.event.game||"Community"} · {new Date(row.event.date).toLocaleString("id-ID")}</p><p className="mt-1 text-xs text-zinc-600">{row.event.route||"Route belum ditentukan"} · {row.event.eventId}</p></div><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">{row.status}</span></div></article>):<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada pendaftaran event.</p>}</div>
  </main>;
}