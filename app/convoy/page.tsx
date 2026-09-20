import {getConvoyEvents} from "@/lib/data";
import {EventRegisterButton} from "@/components/event-register-button";

export const dynamic="force-dynamic";

export default async function ConvoyPage(){
  const items=await getConvoyEvents();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <p className="text-xs font-bold tracking-[.25em] text-orange-400">CONVOY SYSTEM</p>
    <h1 className="mt-2 text-4xl font-black">CONVOY CENTER</h1>
    <p className="mt-3 max-w-3xl text-zinc-400">Pusat informasi, pendaftaran, route, meeting point dan peserta convoy.</p>
    {items.length ? (
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map(item=>{
          const quotaText=item.quota===null?"":" / "+item.quota;
          return <article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-center justify-between"><span className="text-xs font-bold text-orange-300">{item.status}</span><span className="text-xs text-zinc-600">{item.eventId}</span></div>
            <h2 className="mt-4 text-2xl font-black">{item.name}</h2>
            <p className="mt-2 text-sm text-zinc-400">{item.game||"Community"} · {new Date(item.date).toLocaleString("id-ID")}</p>
            <p className="mt-3 text-sm text-zinc-500">Route: {item.route||"Belum ditentukan"}</p>
            <p className="mt-1 text-sm text-zinc-500">Meeting point: {item.meetingPoint||"Belum ditentukan"}</p>
            <p className="mt-4 text-xs text-zinc-600">Peserta: {item._count.participants}{quotaText}</p>
            {item.status==="OPEN"&&<EventRegisterButton eventId={item.id}/>}
          </article>;
        })}
      </div>
    ) : <p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada convoy terjadwal.</p>}
  </main>;
}