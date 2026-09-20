export const dynamic="force-dynamic";

import { getUpcomingEvents } from "@/lib/data";
import { SectionTitle } from "@/components/cards";
import { EventRegisterButton } from "@/components/event-register-button";

export default async function Events(){
  const events=await getUpcomingEvents();
  return <main className="mx-auto max-w-7xl px-6 py-20">
    <SectionTitle eyebrow="Event system" title="Events & Convoys" desc="Convoy, tour, competition, gathering dan community event dalam satu kalender komunitas."/>
    <div className="grid gap-4 md:grid-cols-2">
      {events.length?events.map(e=><article key={e.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <div className="text-xs font-bold text-orange-300">{e.status}</div>
        <h2 className="mt-4 text-xl font-bold">{e.name}</h2>
        <p className="mt-2 text-sm text-zinc-400">{e.game??e.platform?.name??"Community"} · {e.route??"Route TBD"}</p>
        <p className="mt-5 text-xs text-zinc-500">{e.date.toLocaleString("id-ID")} · {e.eventId}</p>
        {e.status==="OPEN"&&<EventRegisterButton eventId={e.id}/>}
      </article>):<p className="rounded-2xl border border-white/10 p-6 text-zinc-500">Belum ada event terjadwal di database.</p>}
    </div>
  </main>;
}