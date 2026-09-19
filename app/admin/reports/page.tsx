"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Report={id:string;reporterId:string|null;targetType:string;targetId:string;reason:string;status:string;createdAt:string};

const statuses=["REPORT","REVIEW","INVESTIGATION","ACTION","CLOSED"];

export default function AdminReportsPage(){
  const [reports,setReports]=useState<Report[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  async function load(){
    const res=await fetch("/api/reports",{cache:"no-store"});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||"Gagal memuat laporan");
    setReports(data.data||[]);
  }

  useEffect(()=>{load().catch(error=>setError(error instanceof Error?error.message:"Gagal memuat laporan")).finally(()=>setLoading(false));},[]);

  async function update(id:string,status:string){
    setError("");
    const res=await fetch(`/api/reports/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok){setError(data.error||"Gagal memperbarui laporan");return;}
    setReports(current=>current.map(item=>item.id===id?{...item,status}:item));
  }

  return <main className="mx-auto max-w-7xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · MODERATION</p><h1 className="mt-2 text-4xl font-black">Laporan komunitas</h1><p className="mt-3 text-zinc-400">Tinjau laporan konten, member, forum, mod, livery, atau showcase.</p></div>
      <Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link>
    </div>
    {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      {loading?<p className="text-zinc-500">Memuat laporan...</p>:reports.length?(
        <div className="space-y-3">{reports.map(report=><article key={report.id} className="rounded-2xl border border-white/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-orange-300">{report.targetType} · {report.targetId}</p>
              <h2 className="mt-2 font-bold">{report.reason}</h2>
              <p className="mt-2 text-xs text-zinc-600">{new Date(report.createdAt).toLocaleString("id-ID")} · reporter {report.reporterId||"anonymous"}</p>
            </div>
            <select value={report.status} onChange={e=>update(report.id,e.target.value)} className="rounded-xl border border-orange-500 bg-white px-3 py-2 font-bold text-orange-700">
              {statuses.map(status=><option key={status}>{status}</option>)}
            </select>
          </div>
        </article>)}</div>
      ):<p className="text-zinc-500">Belum ada laporan.</p>}
    </section>
  </main>;
}