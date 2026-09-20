"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Row={id:string;name:string;category:string;platform:string|null;game:string|null;status:string;createdAt:string;member:{memberId:string;user:{username:string;displayName:string}}};
const statuses=["PENDING","REVIEWING","APPROVED","REJECTED","PUBLISHED","ARCHIVED"];

export default function FleetAdmin(){
  const [rows,setRows]=useState<Row[]>([]);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/admin/fleet",{cache:"no-store"}).then(async response=>{
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Gagal memuat fleet");
      setRows(data.data||[]);
    }).catch(error=>setError(error instanceof Error?error.message:"Gagal memuat fleet"));
  },[]);

  async function update(id:string,status:string){
    const response=await fetch("/api/admin/fleet/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){setError(data.error||"Update gagal");return;}
    setRows(current=>current.map(row=>row.id===id?{...row,status}:row));
  }

  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · FLEET</p><h1 className="mt-2 text-4xl font-black">Fleet moderation</h1></div><Link href="/admin" className="ng-orange-outline">KEMBALI ADMIN</Link></div>
    {error&&<p role="alert" className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
    <section className="mt-8 grid gap-4 md:grid-cols-2">{rows.length?rows.map(row=><article key={row.id} className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-orange-400">{row.category}</p><h2 className="mt-2 text-xl font-black">{row.name}</h2><p className="mt-1 text-xs text-zinc-600">{row.member.memberId} · @{row.member.user.username}</p></div><select value={row.status} onChange={e=>update(row.id,e.target.value)} className="max-w-40 rounded-xl border border-orange-500 bg-white px-2 py-2 font-bold text-orange-700">{statuses.map(status=><option key={status}>{status}</option>)}</select></div>
      <p className="mt-4 text-sm text-zinc-500">{row.platform||row.game||"Community"} · {new Date(row.createdAt).toLocaleString("id-ID")}</p>
    </article>):<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada fleet submission.</p>}</section>
  </main>;
}