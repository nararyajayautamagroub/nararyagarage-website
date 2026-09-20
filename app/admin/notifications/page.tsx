"use client";

import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

export default function AdminNotifications(){
  const [form,setForm]=useState({memberId:"",title:"",body:"",channel:"WEBSITE"});
  const [count,setCount]=useState(0);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    fetch("/api/admin/notifications",{cache:"no-store"})
      .then(async response=>{const data=await response.json().catch(()=>({}));if(response.ok)setCount(Array.isArray(data.data)?data.data.length:0);})
      .catch(()=>{});
  },[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError("");setMessage("");
    const response=await fetch("/api/admin/notifications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,memberId:form.memberId||undefined})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){setError(data.error||"Gagal mengirim notifikasi");return;}
    setMessage("Notifikasi terkirim ke "+String(data.created||0)+" member.");
    setForm({memberId:"",title:"",body:"",channel:"WEBSITE"});
    setCount(current=>current+(Number(data.created)||0));
  }

  return <main className="mx-auto max-w-3xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · NOTIFICATIONS</p><h1 className="mt-2 text-4xl font-black">Notification Center</h1><p className="mt-3 text-zinc-400">Kirim notifikasi ke satu member atau seluruh member aktif.</p></div><Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link></div>
    <form onSubmit={submit} className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <label className="block text-sm font-bold">Member ID <span className="font-normal text-zinc-600">(kosong = semua member aktif)</span><input value={form.memberId} onChange={e=>setForm({...form,memberId:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
      <label className="mt-4 block text-sm font-bold">Judul<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
      <label className="mt-4 block text-sm font-bold">Isi<textarea required value={form.body} onChange={e=>setForm({...form,body:e.target.value})} className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
      <label className="mt-4 block text-sm font-bold">Channel<select value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"><option>WEBSITE</option><option>DISCORD</option><option>EMAIL</option></select></label>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
      {message&&<p className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200">{message}</p>}
      <button className="ng-orange-button mt-6 w-full">KIRIM NOTIFIKASI</button>
      <p className="mt-4 text-center text-xs text-zinc-600">{count} notifikasi terbaru tersimpan.</p>
    </form>
  </main>;
}