import { getPlatform } from "@/lib/data";
import Link from "next/link";

export default async function Platform({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const p=await getPlatform(id.toUpperCase());
  if(!p)return <main className="mx-auto max-w-4xl px-6 py-24"><h1 className="text-4xl font-black">Platform not found</h1><Link className="mt-5 inline-block text-orange-400" href="/community">Back to community</Link></main>;
  const memberCount="memberCount" in p ? p.memberCount : null;
  const eventCount="eventCount" in p ? p.eventCount : null;
  return <main className="mx-auto max-w-5xl px-6 py-20"><p className="text-sm font-bold uppercase tracking-[.25em] text-orange-400">Community profile</p><h1 className="mt-3 text-5xl font-black">{p.name}</h1><p className="mt-5 max-w-2xl text-zinc-400">Chapter {p.id} menjadi ruang untuk member, event, convoy, gallery, resource, forum dan karya creator.</p><div className="mt-10 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 p-6"><p className="text-sm text-zinc-500">Members</p><p className="mt-2 text-3xl font-black">{memberCount ?? "—"}</p></div><div className="rounded-2xl border border-white/10 p-6"><p className="text-sm text-zinc-500">Events</p><p className="mt-2 text-3xl font-black">{eventCount ?? "—"}</p></div><div className="rounded-2xl border border-white/10 p-6"><p className="text-sm text-zinc-500">Showcase</p><p className="mt-2 text-3xl font-black">—</p></div></div></main>;
}