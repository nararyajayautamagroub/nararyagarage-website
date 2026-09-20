"use client";

import Link from "next/link";
import {FormEvent,useState} from "react";

export default function MemberFleet(){
  const [form,setForm]=useState({name:"",category:"BUS",platform:"BUSSID",game:"",chassis:"",body:"",livery:"",screenshotUrl:"",description:""});
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setMessage("");
    const response=await fetch("/api/fleet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,screenshotUrl:form.screenshotUrl||null})});
    const data=await response.json().catch(()=>({}));
    if(response.status===401){window.location.href="/login?next=/member/fleet";return;}
    if(!response.ok){setError(data.error||"Fleet submission gagal");return;}
    setMessage("Fleet berhasil dikirim untuk moderasi.");
    setForm({name:"",category:"BUS",platform:"BUSSID",game:"",chassis:"",body:"",livery:"",screenshotUrl:"",description:""});
  }

  return <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · FLEET</p><h1 className="mt-2 text-4xl font-black">Submit Fleet</h1></div><Link href="/fleet" className="ng-orange-outline">FLEET SHOWCASE</Link></div>
    <form onSubmit={submit} className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nama kendaraan" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="rounded-xl border border-white/10 bg-black px-4 py-3"><option>BUS</option><option>TRUCK</option><option>CAR</option><option>OTHER</option></select>
        <input value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})} placeholder="Platform" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
        <input value={form.game} onChange={e=>setForm({...form,game:e.target.value})} placeholder="Game" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
        <input value={form.chassis} onChange={e=>setForm({...form,chassis:e.target.value})} placeholder="Chassis" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
        <input value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Body" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
        <input value={form.livery} onChange={e=>setForm({...form,livery:e.target.value})} placeholder="Livery" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
        <input type="url" value={form.screenshotUrl} onChange={e=>setForm({...form,screenshotUrl:e.target.value})} placeholder="Screenshot URL" className="rounded-xl border border-white/10 bg-black px-4 py-3"/>
      </div>
      <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Deskripsi" className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-black px-4 py-3"/>
      {error&&<p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
      {message&&<p className="mt-4 rounded-xl bg-orange-500/10 p-4 text-orange-200">{message}</p>}
      <button className="ng-orange-button mt-5 w-full">KIRIM FLEET</button>
    </form>
  </main>;
}