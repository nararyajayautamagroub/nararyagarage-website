"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Row={id:string;desiredRole:string;motivation:string;experience:string|null;portfolioUrl:string|null;status:string;createdAt:string;member:{memberId:string;user:{username:string;displayName:string;email:string}}};
const statuses=["PENDING","REVIEWING","ACCEPTED","REJECTED","WITHDRAWN"];

export default function RecruitmentAdmin(){
  const [rows,setRows]=useState<Row[]>([]);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/admin/recruitment",{cache:"no-store"}).then(async response=>{
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Gagal memuat recruitment");
      setRows(data.data||[]);
    }).catch(error=>setError(error instanceof Error?error.message:"Gagal memuat recruitment"));
  },[]);

  async function update(id:string,status:string){
    const response=await fetch("/api/admin/recruitment/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){setError(data.error||"Update gagal");return;}
    setRows(current=>current.map(row=>row.id===id?{...row,status}:row));
  }

  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · RECRUITMENT</p><h1 className="mt-2 text-4xl font-black">Recruitment applications</h1></div><Link href="/admin" className="ng-orange-outline">KEMBALI ADMIN</Link></div>
    {error&&<p role="alert" className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
    <section className="mt-8 space-y-4">{rows.length?rows.map(row=><article key={row.id} className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold tracking-widest text-orange-400">{row.desiredRole}</p><h2 className="mt-2 text-xl font-black">{row.member.user.displayName}</h2><p className="mt-1 text-xs text-zinc-600">@{row.member.user.username} · {row.member.memberId} · {row.member.user.email}</p></div><select value={row.status} onChange={e=>update(row.id,e.target.value)} className="rounded-xl border border-orange-500 bg-white px-3 py-2 font-bold text-orange-700">{statuses.map(status=><option key={status}>{status}</option>)}</select></div>
      <p className="mt-5 whitespace-pre-wrap text-zinc-400">{row.motivation}</p>
      {row.experience&&<p className="mt-4 whitespace-pre-wrap text-sm text-zinc-500">Experience: {row.experience}</p>}
      {row.portfolioUrl&&<a href={row.portfolioUrl} target="_blank" rel="noreferrer" className="ng-orange-outline mt-5 inline-flex">PORTFOLIO</a>}
    </article>):<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada recruitment application.</p>}</section>
  </main>;
}