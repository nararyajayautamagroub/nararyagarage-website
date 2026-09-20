"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Repo={
  id:number;
  full_name:string;
  name:string;
  private:boolean;
  html_url:string;
  default_branch:string;
  description:string|null;
  updated_at:string;
  stargazers_count:number;
  open_issues_count:number;
  language:string|null;
};

type Label={name:string;purpose:string};

export function RepositoryGrid({initialRows,labels}:{initialRows:Repo[];labels:Record<string,Label>}){
  const [rows,setRows]=useState(initialRows);
  const [lastRefresh,setLastRefresh]=useState(new Date().toISOString());
  const [refreshing,setRefreshing]=useState(false);

  useEffect(()=>{
    let active=true;
    const refresh=async()=>{
      if(document.visibilityState==="hidden")return;
      setRefreshing(true);
      try{
        const response=await fetch("/api/github/repositories",{cache:"no-store"});
        const payload=await response.json();
        if(active&&response.ok){
          setRows(Array.isArray(payload.repositories)?payload.repositories:[]);
          setLastRefresh(payload.generatedAt||new Date().toISOString());
        }
      }catch{}finally{
        if(active)setRefreshing(false);
      }
    };
    const timer=window.setInterval(refresh,30000);
    return()=>{
      active=false;
      window.clearInterval(timer);
    };
  },[]);

  return <section className="mt-8">
    <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
      <span>{rows.length} repository terdeteksi</span>
      <span>{refreshing?"Memperbarui...":"Terakhir: "+new Date(lastRefresh).toLocaleTimeString("id-ID")}</span>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {rows.length?rows.map(repo=>{
        const label=labels[repo.full_name];
        const [owner,name]=repo.full_name.split("/");
        return <article key={repo.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-[0_5px_18px_rgba(0,0,0,.10)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-bold">{label?.name??repo.name}</h2>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs">{repo.private?"PRIVATE":"PUBLIC"}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">{repo.full_name}</p>
          <p className="mt-4 text-zinc-400">{label?.purpose??repo.description??"REPOSITORY TANPA DESKRIPSI"}</p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div><span className="text-zinc-600">Issues</span><b className="block">{repo.open_issues_count}</b></div>
            <div><span className="text-zinc-600">Stars</span><b className="block">{repo.stargazers_count}</b></div>
            <div><span className="text-zinc-600">Updated</span><b className="block">{new Date(repo.updated_at).toLocaleDateString("id-ID")}</b></div>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Branch: {repo.default_branch} · Language: {repo.language??"—"}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={"/repositories/"+encodeURIComponent(owner)+"/"+encodeURIComponent(name)} className="ng-orange-button">DETAIL LIVE</Link>
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="ng-orange-outline">GITHUB</a>
          </div>
        </article>;
      }):<p className="rounded-2xl border border-white/10 p-6 text-zinc-500">Tidak ada repository yang bisa dibaca saat ini.</p>}
    </div>
  </section>;
}