import Link from "next/link";
import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";

export default async function MemberPage(){
  const session=await getSession();
  if(!session)redirect("/login?next=/member");
  const prisma=getPrisma();
  if(!prisma)return <main className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-8"><h1 className="text-3xl font-black">Database belum terhubung</h1><p className="mt-3 text-zinc-300">Set DATABASE_URL untuk mengaktifkan member center.</p></div></main>;

  const member=await prisma.member.findUnique({
    where:{userId:session.user.id},
    include:{
      events:{
        include:{event:{select:{id:true,eventId:true,name:true,type:true,date:true,status:true}}},
        orderBy:{registeredAt:"desc"},
        take:5
      },
      achievements:{include:{achievement:true},orderBy:{earnedAt:"desc"},take:6}
    }
  });
  const notifications=member?await prisma.notification.findMany({where:{memberId:member.id},orderBy:{createdAt:"desc"},take:5}):[];
  if(!member)return <main className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-3xl border border-white/10 bg-zinc-950 p-8"><h1 className="text-3xl font-black">Profil member belum siap</h1><p className="mt-3 text-zinc-400">Akun ini belum memiliki record member.</p></div></main>;

  return <main className="mx-auto max-w-6xl px-6 py-14">
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER CENTER</p><h1 className="mt-2 text-4xl font-black">{session.user.displayName}</h1><p className="mt-2 text-zinc-400">@{session.user.username} · {member.memberId} · {member.role}</p></div>
        <Link href="/events" className="ng-orange-button inline-flex w-fit">LIHAT EVENT</Link>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="font-black">Registrasi event</h2><p className="mt-2 text-sm text-zinc-400">{member.events.length} aktivitas terakhir</p></section>
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="font-black">Achievement</h2><p className="mt-2 text-sm text-zinc-400">{member.achievements.length} achievement terbaru</p></section>
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="font-black">Notifikasi</h2><p className="mt-2 text-sm text-zinc-400">{notifications.filter(item=>!item.readAt).length} belum dibaca</p></section>
      </div>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
        <h2 className="text-2xl font-black">Event saya</h2>
        <div className="mt-5 space-y-3">{member.events.length?member.events.map(item=><div key={item.eventId} className="rounded-2xl border border-white/10 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-bold">{item.event.name}</p><p className="mt-1 text-xs text-zinc-500">{item.event.type} · {new Date(item.event.date).toLocaleString("id-ID")}</p></div><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">{item.status}</span></div></div>):<p className="text-zinc-500">Belum ada registrasi event.</p>}</div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
        <h2 className="text-2xl font-black">Notifikasi</h2>
        <div className="mt-5 space-y-3">{notifications.length?notifications.map(item=><div key={item.id} className="rounded-2xl border border-white/10 p-4"><p className="font-bold">{item.title}</p><p className="mt-1 text-sm text-zinc-400">{item.body}</p><p className="mt-2 text-xs text-zinc-600">{new Date(item.createdAt).toLocaleString("id-ID")}</p></div>):<p className="text-zinc-500">Belum ada notifikasi.</p>}</div>
      </section>
    </div>

    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <h2 className="text-2xl font-black">Achievement terbaru</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{member.achievements.map(item=><div key={item.achievementId} className="rounded-2xl border border-white/10 p-4"><p className="font-bold text-orange-300">{item.achievement.name}</p><p className="mt-1 text-sm text-zinc-400">{item.achievement.description}</p></div>)}</div>
    </section>
  </main>;
}