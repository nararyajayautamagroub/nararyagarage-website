import {getPrisma} from "@/lib/prisma";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function FleetPage(){
  const prisma=getPrisma();
  const rows=prisma?await prisma.fleetVehicle.findMany({
    where:{status:"PUBLISHED"},
    orderBy:{createdAt:"desc"},
    take:200,
    select:{id:true,name:true,category:true,platform:true,game:true,chassis:true,body:true,livery:true,screenshotUrl:true,description:true,member:{select:{memberId:true,user:{select:{displayName:true}}}}}
  }).catch(()=>[]):[];

  return <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-black tracking-[.25em] text-orange-400">FLEET DATABASE</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Fleet Showcase</h1><p className="mt-4 max-w-3xl text-zinc-400">Data armada yang sudah dipublikasikan setelah moderasi.</p></div>
      <Link href="/member/fleet" className="ng-orange-button">SUBMIT FLEET</Link>
    </div>
    {rows.length?<div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rows.map(item=><article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      {item.screenshotUrl?<a href={item.screenshotUrl} target="_blank" rel="noreferrer" aria-label={"Buka gambar "+item.name} className="block aspect-video bg-cover bg-center bg-no-repeat" style={{backgroundImage:`url("${item.screenshotUrl}")`}}/>:<div className="aspect-video bg-black"/>}
      <div className="p-6"><p className="text-xs font-bold tracking-widest text-orange-400">{item.category}</p><h2 className="mt-2 text-xl font-black">{item.name}</h2><p className="mt-2 text-sm text-zinc-500">{item.platform||item.game||"Community"} · {item.chassis||"Chassis belum diisi"}</p><p className="mt-2 text-sm text-zinc-500">{item.body||"Body belum diisi"} · {item.livery||"Livery belum diisi"}</p><p className="mt-4 text-sm text-zinc-400">{item.description||"Tidak ada deskripsi."}</p><p className="mt-4 text-xs text-zinc-600">Member {item.member.memberId} · {item.member.user.displayName}</p></div>
    </article>)}</div>:<p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada armada yang dipublikasikan.</p>}
  </main>;
}