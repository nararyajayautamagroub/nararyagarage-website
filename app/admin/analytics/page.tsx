"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Metrics=Record<string,number>;

export default function AdminAnalytics(){
  const [metrics,setMetrics]=useState<Metrics|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    fetch("/api/admin/analytics",{cache:"no-store"}).then(async response=>{
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Gagal memuat analytics");
      setMetrics(data.data||null);
    }).catch(error=>setError(error instanceof Error?error.message:"Gagal memuat analytics"));
  },[]);

  return <main className="mx-auto max-w-7xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · ANALYTICS</p><h1 className="mt-2 text-4xl font-black">Live Analytics</h1><p className="mt-3 text-zinc-400">Ringkasan langsung dari PostgreSQL dan GitHub.</p></div><Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link></div>
    {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics?Object.entries(metrics).map(([key,value])=><article key={key} className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-widest text-zinc-600">{key}</p><p className="mt-3 text-3xl font-black text-orange-400">{value}</p></article>):<p className="text-zinc-500">Memuat...</p>}</div>
  </main>;
}