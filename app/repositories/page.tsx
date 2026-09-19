import { listOwnedRepositories } from "@/lib/github";
import { managedRepositories } from "@/data/repositories";

export const dynamic="force-dynamic";

export default async function Repositories(){
  const rows=await listOwnedRepositories().catch(()=>[]);
  const labels=new Map(managedRepositories.map(r=>[r.fullName,r]));
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <p className="text-sm font-bold tracking-[.25em] text-orange-400">LIVE DATA HUB</p>
    <h1 className="mt-3 text-5xl font-black">CONNECTED REPOSITORIES</h1>
    <p className="mt-4 max-w-3xl text-zinc-400">Daftar repository milik akun yang sedang terhubung dibaca langsung dari GitHub. Repository baru ikut terdeteksi otomatis, bukan ditulis manual satu per satu. Manusia memang suka membuat daftar, lalu lupa memperbaruinya.</p>
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      {rows.map(repo=>{
        const label=labels.get(repo.full_name);
        return <article key={repo.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <div className="flex items-center justify-between gap-4"><h2 className="font-bold">{label?.name ?? repo.name}</h2><span className="rounded-full border border-white/10 px-3 py-1 text-xs">{repo.private?"PRIVATE":"PUBLIC"}</span></div>
          <p className="mt-2 text-sm text-zinc-500">{repo.full_name}</p>
          <p className="mt-4 text-zinc-400">{label?.purpose ?? repo.description ?? "UNMAPPED REPOSITORY"}</p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div><span className="text-zinc-600">Issues</span><b className="block">{repo.open_issues_count}</b></div>
            <div><span className="text-zinc-600">Stars</span><b className="block">{repo.stargazers_count}</b></div>
            <div><span className="text-zinc-600">Updated</span><b className="block">{new Date(repo.updated_at).toLocaleDateString("id-ID")}</b></div>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Branch: {repo.default_branch} · Language: {repo.language ?? "—"}</p>
          <a href={repo.html_url} target="_blank" rel="noreferrer" className="mt-6 inline-block text-orange-400">Open repository →</a>
        </article>
      })}
    </div>
  </main>
}