"use client";

import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

type Setting={key:string;value:unknown};

export default function AdminSettings(){
  const [settings,setSettings]=useState<Setting[]>([]);
  const [key,setKey]=useState("");
  const [value,setValue]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    const response=await fetch("/api/admin/settings",{cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||"Gagal memuat settings");
    setSettings(data.data||[]);
  }

  useEffect(()=>{load().catch(error=>setError(error instanceof Error?error.message:"Gagal memuat settings"));},[]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setMessage("");
    let parsed:unknown=value;
    try{parsed=JSON.parse(value);}catch{}
    const response=await fetch("/api/admin/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,value:parsed})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){setError(data.error||"Gagal menyimpan setting");return;}
    setMessage("Setting berhasil disimpan.");
    setKey("");setValue("");await load();
  }

  return <main className="mx-auto max-w-4xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · SETTINGS</p><h1 className="mt-2 text-4xl font-black">Site Settings</h1><p className="mt-3 text-zinc-400">Pengaturan key-value untuk konfigurasi yang memang aman disimpan di database.</p></div><Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link></div>
    <form onSubmit={save} className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <label className="block text-sm font-bold">Key<input required value={key} onChange={e=>setKey(e.target.value.toUpperCase())} placeholder="SITE.TAGLINE" className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
      <label className="mt-4 block text-sm font-bold">Value<textarea required value={value} onChange={e=>setValue(e.target.value)} placeholder='{"enabled":true}' className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-sm outline-none focus:border-orange-500"/></label>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
      {message&&<p className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200">{message}</p>}
      <button className="ng-orange-button mt-6 w-full">SIMPAN SETTING</button>
    </form>
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <h2 className="text-2xl font-black">Current settings</h2>
      <div className="mt-5 space-y-2">{settings.length?settings.map(item=><div key={item.key} className="rounded-2xl border border-white/10 p-4"><p className="font-bold">{item.key}</p><pre className="mt-2 overflow-auto text-xs text-zinc-500">{JSON.stringify(item.value,null,2)}</pre></div>):<p className="text-zinc-500">Belum ada settings.</p>}</div>
    </section>
  </main>;
}