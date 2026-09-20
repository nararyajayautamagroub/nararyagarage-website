import {getDownloads} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function DownloadsPage(){
  const downloads=await getDownloads();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">DOWNLOAD CENTER</h1>
    <p className="mt-3 text-zinc-400">Community files, templates, tools, livery, mod, resource, dan dokumen.</p>
    <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
      {downloads.length?<table className="w-full text-left text-sm"><thead><tr className="border-b border-white/10"><th className="p-4">File</th><th>Version</th><th>Author</th><th>License</th><th>Downloads</th><th></th></tr></thead>
      <tbody>{downloads.map(item=><tr key={item.id} className="border-b border-white/5"><td className="p-4 font-medium">{item.name}</td><td>{item.version||"—"}</td><td>{item.author||"—"}</td><td>{item.license||"—"}</td><td>{item.downloads}</td><td className="p-4"><a className="ng-orange-outline" href={item.url} target="_blank" rel="noreferrer">OPEN</a></td></tr>)}</tbody></table>
      :<p className="p-7 text-zinc-500">Belum ada file yang dipublikasikan.</p>}
    </div>
  </main>;
}