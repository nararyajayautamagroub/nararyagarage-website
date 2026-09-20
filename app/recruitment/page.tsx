"use client";

import {FormEvent,useEffect,useState} from "react";
import Link from "next/link";

type Application={id:string;desiredRole:string;motivation:string;experience:string|null;portfolioUrl:string|null;status:string;createdAt:string};

export default function RecruitmentPage(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [rows,setRows]=useState<Application[]>([]);
  const [form,setForm]=useState({desiredRole:"",motivation:"",experience:"",portfolioUrl:""});
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  async function load(){
    const response=await fetch("/api/recruitment",{cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    setLoggedIn(response.ok);
    if(response.ok)setRows(data.data||[]);
  }

  useEffect(()=>{load().catch(()=>setLoggedIn(false));},[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setMessage("");
    const response=await fetch("/api/recruitment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,experience:form.experience||null,portfolioUrl:form.portfolioUrl||null})});
    const data=await response.json().catch(()=>({}));
    if(response.status===401){window.location.href="/login?next=/recruitment";return;}
    if(!response.ok){setError(data.error||"Pengajuan gagal");return;}
    setMessage("Pengajuan recruitment berhasil dikirim.");
    setForm({desiredRole:"",motivation:"",experience:"",portfolioUrl:""});
    await load();
  }

  return <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
    <p className="text-xs font-black tracking-[.25em] text-orange-400">NARARYA GARAGE · RECRUITMENT</p>
    <h1 className="mt-2 text-4xl font-black sm:text-5xl">Join the Team</h1>
    <p className="mt-4 max-w-3xl text-zinc-400">Pengajuan role komunitas diproses oleh staff/admin dan setiap status tersimpan di database.</p>

    {loggedIn&&<section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <h2 className="text-xl font-black">Pengajuan saya</h2>
      <div className="mt-4 space-y-3">{rows.length?rows.map(row=><article key={row.id} className="rounded-2xl border border-white/10 p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-bold">{row.desiredRole}</p><p className="mt-1 text-xs text-zinc-600">{new Date(row.createdAt).toLocaleString("id-ID")}</p></div><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">{row.status}</span></div></article>):<p className="text-sm text-zinc-600">Belum ada pengajuan.</p>}</div>
    </section>}

    <form onSubmit={submit} className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <h2 className="text-xl font-black">Form recruitment</h2>
      <div className="mt-5 grid gap-4">
        <input required value={form.desiredRole} onChange={e=>setForm({...form,desiredRole:e.target.value})} placeholder="Role yang diinginkan" className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
        <textarea required minLength={20} value={form.motivation} onChange={e=>setForm({...form,motivation:e.target.value})} placeholder="Motivasi" className="min-h-36 rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
        <textarea value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} placeholder="Pengalaman" className="min-h-28 rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
        <input type="url" value={form.portfolioUrl} onChange={e=>setForm({...form,portfolioUrl:e.target.value})} placeholder="Portfolio URL" className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
      </div>
      {error&&<p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {message&&<p className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">{message}</p>}
      <button className="ng-orange-button mt-5 w-full">KIRIM RECRUITMENT</button>
      {!loggedIn&&<p className="mt-4 text-center text-xs text-zinc-600">Kamu akan diminta login saat mengirim pengajuan.</p>}
    </form>
    <Link href="/member" className="ng-orange-outline mt-5 inline-flex">MEMBER CENTER</Link>
  </main>;
}