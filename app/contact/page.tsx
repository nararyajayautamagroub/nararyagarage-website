import {getContactLinks} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function ContactPage(){
  const links=await getContactLinks();
  return <main className="mx-auto max-w-5xl px-6 py-16">
    <h1 className="text-4xl font-black">CONTACT</h1>
    <p className="mt-3 text-zinc-400">Kontak resmi dan jalur komunikasi komunitas dari konfigurasi situs.</p>
    <div className="mt-10 grid gap-4 md:grid-cols-2">{links.map(item=><article key={item.key} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <h2 className="font-bold">{item.label}</h2>
      {item.url?<a href={item.url} target="_blank" rel="noreferrer" className="ng-orange-outline mt-4 inline-flex">BUKA {item.label.toUpperCase()}</a>:<p className="mt-2 text-sm text-zinc-600">Link resmi belum dikonfigurasi di Settings.</p>}
    </article>)}</div>
  </main>;
}
