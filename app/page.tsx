export const dynamic="force-dynamic";

import Link from "next/link";
import { ArrowRight, ChevronRight, Users, Route, Camera, Boxes } from "lucide-react";
import { getPlatforms, getUpcomingEvents } from "@/lib/data";
import { FeatureCard, PlatformCard, SectionTitle } from "@/components/cards";

const stats = [
  ["COMMUNITY", Users],
  ["EVENTS", Route],
  ["SHOWCASE", Camera],
  ["RESOURCES", Boxes],
] as const;

export default async function Home() {
  const [platforms, events] = await Promise.all([getPlatforms(), getUpcomingEvents()]);
  return <main>
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,.18),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-28 md:grid-cols-[1.2fr_.8fr] md:py-36">
        <div>
          <p className="mb-5 text-sm font-bold tracking-[.3em] text-orange-400">VIRTUAL SIMULATOR & GAMING COMMUNITY</p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">GARAGE FOR<br /><span className="text-orange-400">EVERY DRIVER.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">Pusat komunitas untuk BUSSID, ETS2, ATS, TOE3, TSI, Roblox dan platform simulator yang terus berkembang.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/community" className="ng-orange-button">JOIN COMMUNITY <ArrowRight className="ml-2 inline" size={18} /></Link>
            <Link href="/events" className="rounded-xl border border-white/15 px-5 py-3 font-bold transition hover:bg-white/5">EXPLORE EVENTS</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-end">{stats.map(([name, Icon]) => <div key={name} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><Icon className="text-orange-400" /><p className="mt-10 text-sm font-bold">{name}</p></div>)}</div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-20"><SectionTitle eyebrow="Community" title="One garage, many platforms." desc="Platform dibuat modular supaya game baru bisa ditambahkan lewat data dan admin, bukan bongkar rumah setiap minggu."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{platforms.map(p => <PlatformCard key={p.id} p={p}/>)}</div></section>
    <section className="border-y border-white/10 bg-white/[.02]"><div className="mx-auto max-w-7xl px-6 py-20"><SectionTitle eyebrow="Events" title="Convoy starts here." desc="Kelola event, registrasi peserta, rute, organizer, attendance dan dokumentasi dalam satu alur."/><div className="grid gap-4 md:grid-cols-2">{events.length ? events.map(e => <article key={e.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><div className="text-xs font-bold text-orange-300">{e.status}</div><h3 className="mt-4 text-xl font-bold">{e.name}</h3><p className="mt-2 text-sm text-zinc-400">{e.game ?? e.platform?.name ?? "Community"} · {e.route ?? "Route TBD"}</p><p className="mt-5 text-xs text-zinc-500">{e.date.toLocaleString("id-ID")} · {e.eventId}</p></article>) : <p className="rounded-2xl border border-white/10 p-6 text-zinc-500">Belum ada event terjadwal di database.</p>}</div></div></section>
    <section className="mx-auto max-w-7xl px-6 py-20"><SectionTitle eyebrow="Creator ecosystem" title="Showcase without mystery credits." desc="Setiap karya punya ruang untuk author, base, edit, license dan credits. Internet sudah cukup penuh dengan 'ini punya gue'."/><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><FeatureCard icon="wrench" title="Mod Showcase" text="Karya mod dengan author, base, edit, credits dan license yang jelas."/><FeatureCard icon="shield" title="Livery Showcase" text="Koleksi livery komunitas dengan metadata kendaraan dan creator."/><FeatureCard icon="shield" title="3D Showcase" text="Preview asset 3D, software, texture dan informasi lisensi."/><FeatureCard icon="shield" title="Fleet Showcase" text="Tampilkan bus, truck, car dan kendaraan simulator milik komunitas."/></div><Link href="/showcase" className="mt-8 inline-flex items-center gap-2 font-bold text-orange-400">Explore showcase <ChevronRight size={18}/></Link></section>
  </main>;
}