"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Log={id:string;memberId:string|null;action:string;entityType:string|null;entityId:string|null;metadata:unknown;createdAt:string};

export default function AdminLogs(){
  const [logs,setLogs]=useState<Log[]>([]);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/admin/logs",{cache:"no-store"})
      .then(async response=>{
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||"Gagal memuat log");
        setLogs(Array.isArray(data.data)?data.data:[]);
      })
      .catch(error=>setError(error instanceof Error?error.message:"Gagal memuat log"));
  },[]);

  return <main className="mx-auto max-w-7xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · LOGS</p><h1 className="mt-2 text-4xl font-black">Activity Logs</h1><p className="mt-3 text-zinc-400">Audit trail perubahan penting di area admin dan komunitas.</p></div>
      <Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link>
    </div>
    {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">{error}</p>}
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      {logs.length?<div className="space-y-3">{logs.map(log=>{
        const metadataText=log.metadata===null||log.metadata===undefined?"":JSON.stringify(log.metadata,null,2);
        return <article key={log.id} className="rounded-2xl border border-white/10 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><p className="font-bold text-orange-300">{log.action}</p><p className="text-xs text-zinc-600">{new Date(log.createdAt).toLocaleString("id-ID")}</p></div>
          <p className="mt-1 text-xs text-zinc-500">{log.entityType||"—"} · {log.entityId||"—"} · member {log.memberId||"system"}</p>
          {metadataText&&<pre className="mt-3 overflow-auto rounded-xl bg-black p-3 text-xs text-zinc-500">{metadataText}</pre>}
        </article>;
      })}</div>:<p className="text-zinc-500">Belum ada activity log.</p>}
    </section>
  </main>;
}