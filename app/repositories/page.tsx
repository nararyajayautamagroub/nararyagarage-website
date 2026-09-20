import { listOwnedRepositories } from "@/lib/github";
import { managedRepositories } from "@/data/repositories";
import { RepositoryGrid } from "@/components/repository-grid";

export const dynamic="force-dynamic";

export default async function Repositories(){
  const rows=await listOwnedRepositories().catch(()=>[]);
  const labels=new Map(managedRepositories.map(r=>[r.fullName,r]));
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <p className="text-sm font-bold tracking-[.25em] text-orange-400">LIVE DATA HUB</p>
    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-5xl font-black">CONNECTED REPOSITORIES</h1>
        <p className="mt-4 max-w-3xl text-zinc-400">Repository milik akun terhubung dibaca langsung dari GitHub. Daftar baru ikut muncul otomatis tanpa perlu menulis ulang data manual.</p>
      </div>
      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-300">LIVE · AUTO REFRESH 30s</span>
    </div>
    <RepositoryGrid initialRows={rows} labels={Object.fromEntries(labels.entries())}/>
  </main>;
}
