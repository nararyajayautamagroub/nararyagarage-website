import Link from "next/link";
import {notFound} from "next/navigation";
import {getRepositoryDeepSnapshot} from "@/lib/github";

export const dynamic="force-dynamic";

export default async function RepositoryDetail({params}:{params:Promise<{owner:string;name:string}>}){
  const {owner,name}=await params;
  let data;
  try{
    data=await getRepositoryDeepSnapshot(`${owner}/${name}`);
  }catch{
    notFound();
  }

  const packageName=typeof data.packageJson?.name==="string"?data.packageJson.name:null;
  const packageVersion=typeof data.packageJson?.version==="string"?data.packageJson.version:null;
  const dependencies=data.packageJson?.dependencies&&typeof data.packageJson.dependencies==="object"
    ?Object.keys(data.packageJson.dependencies as Record<string,unknown>)
    :[];

  return <main className="mx-auto max-w-7xl px-6 py-14">
    <Link href="/repositories" className="text-sm font-bold text-orange-400 hover:text-orange-300">← Semua repository</Link>

    <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black tracking-[.25em] text-orange-400">LIVE REPOSITORY DATA</p>
          <h1 className="mt-2 break-words text-4xl font-black">{data.repository.name}</h1>
          <p className="mt-2 text-zinc-500">{data.repository.full_name}</p>
          <p className="mt-5 max-w-3xl text-zinc-400">{data.repository.description||"Tidak ada deskripsi repository."}</p>
        </div>
        <a href={data.repository.html_url} target="_blank" rel="noreferrer" className="ng-orange-button">BUKA DI GITHUB</a>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Visibility",data.repository.private?"PRIVATE":"PUBLIC"],
          ["Branch",data.repository.default_branch],
          ["Language",data.repository.language||"—"],
          ["Issues",String(data.repository.open_issues_count)]
        ].map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-2 font-bold">{value}</p></div>)}
      </div>
    </section>

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
        <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black">README</h2><span className="text-xs text-zinc-600">{new Date(data.fetchedAt).toLocaleString("id-ID")}</span></div>
        <pre className="mt-5 max-h-[650px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black p-5 text-sm leading-6 text-zinc-300">{data.readme||"README tidak tersedia."}</pre>
      </section>

      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
          <h2 className="text-2xl font-black">Repository runtime</h2>
          <p className="mt-3 text-sm text-zinc-400">{packageName||"package.json tidak ditemukan"}{packageVersion?` · v${packageVersion}`:""}</p>
          <p className="mt-3 text-xs text-zinc-600">{dependencies.length} dependency langsung terdeteksi.</p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
          <h2 className="text-2xl font-black">Languages</h2>
          <div className="mt-4 space-y-2">{Object.entries(data.languages).sort((a,b)=>b[1]-a[1]).map(([language,bytes])=><div key={language} className="flex items-center justify-between text-sm"><span>{language}</span><span className="text-zinc-500">{bytes.toLocaleString("id-ID")} B</span></div>)}</div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
          <h2 className="text-2xl font-black">Latest commits</h2>
          <div className="mt-4 space-y-3">{data.commits.map(commit=><a key={commit.sha} href={commit.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 p-4 transition hover:border-orange-500/40 hover:bg-orange-500/5"><p className="font-semibold">{commit.message||"Untitled commit"}</p><p className="mt-1 text-xs text-zinc-600">{commit.author} · {commit.date?new Date(commit.date).toLocaleString("id-ID"):"—"}</p></a>)}</div>
        </section>
      </div>
    </div>

    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><h2 className="text-2xl font-black">Repository tree</h2><p className="mt-2 text-sm text-zinc-500">Metadata file/folder dibaca dari branch {data.repository.default_branch}.</p></div><span className="text-xs text-zinc-600">{data.tree.length} item ditampilkan{data.treeTruncated?" · tree dipotong pada 5.000 item":""}</span></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data.tree.slice(0,300).map(item=><div key={item.path} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400">{item.path}</div>)}</div>
    </section>
  </main>;
}