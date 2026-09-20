import {getPartners} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function PartnersPage(){
  const partners=await getPartners();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">PARTNERS & COLLAB</h1>
    <p className="mt-3 text-zinc-400">Community partner, event partner, creator, developer, designer, dan sponsor.</p>
    {partners.length ? (
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partners.map(partner=><article key={partner.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">{partner.collaborationType}</p>
          <h2 className="mt-2 text-xl font-black">{partner.name}</h2>
          <p className="mt-3 text-sm text-zinc-400">{partner.description||"Tidak ada deskripsi."}</p>
          {partner.link&&<a href={partner.link} target="_blank" rel="noreferrer" className="ng-orange-outline mt-5 inline-flex">VISIT</a>}
        </article>)}
      </div>
    ) : <p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada partner yang terdaftar.</p>}
  </main>;
}