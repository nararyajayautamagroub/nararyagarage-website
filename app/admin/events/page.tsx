"use client";

import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

type EventRow={id:string;eventId:string;name:string;type:string;date:string;status:string;quota:number|null;game:string|null;route:string|null};

const initial={eventId:"",name:"",type:"Convoy",date:"",game:"BUSSID",quota:"",route:"",status:"DRAFT"};

export default function AdminEventsPage(){
  const [events,setEvents]=useState<EventRow[]>([]);
  const [form,setForm]=useState(initial);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function load(){
    const res=await fetch("/api/admin/events",{cache:"no-store"});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||"Gagal memuat event");
    setEvents(data.data||[]);
  }

  useEffect(()=>{load().catch(error=>setError(error instanceof Error?error.message:"Gagal memuat event"));},[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setError("");setMessage("");
    try{
      const payload={
        eventId:form.eventId,
        name:form.name,
        type:form.type,
        game:form.game||null,
        date:new Date(form.date).toISOString(),
        quota:form.quota?Number(form.quota):null,
        route:form.route||null,
        status:form.status
      };
      const res=await fetch("/api/admin/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await res.json().catch(()=>({}));
      if(res.status===401||res.status===403)throw new Error("Akses admin ditolak.");
      if(!res.ok)throw new Error(data.error||"Gagal membuat event");
      setForm(initial);setMessage("Event berhasil dibuat.");await load();
    }catch(error){setError(error instanceof Error?error.message:"Gagal membuat event");}
    finally{setLoading(false);}
  }

  return <main className="mx-auto max-w-7xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · EVENTS</p><h1 className="mt-2 text-4xl font-black">Kelola Event & Convoy</h1><p className="mt-3 text-zinc-400">Buat, lihat, ubah, dan kelola event dari panel admin.</p></div>
      <Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
        <h2 className="text-2xl font-black">Buat event</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm font-bold">Event ID<input required value={form.eventId} onChange={e=>setForm({...form,eventId:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
          <label className="text-sm font-bold">Nama<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">Tipe<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"><option>Convoy</option><option>Tour</option><option>Competition</option><option>Community Event</option></select></label>
            <label className="text-sm font-bold">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"><option>DRAFT</option><option>OPEN</option><option>CLOSED</option><option>CANCELLED</option><option>COMPLETED</option></select></label>
          </div>
          <label className="text-sm font-bold">Tanggal & waktu<input required type="datetime-local" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">Game<input value={form.game} onChange={e=>setForm({...form,game:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
            <label className="text-sm font-bold">Kuota<input type="number" min="1" value={form.quota} onChange={e=>setForm({...form,quota:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
          </div>
          <label className="text-sm font-bold">Rute<input value={form.route} onChange={e=>setForm({...form,route:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
        </div>
        {error&&<p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        {message&&<p className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">{message}</p>}
        <button disabled={loading} className="ng-orange-button mt-5 w-full">{loading?"Menyimpan...":"BUAT EVENT"}</button>
      </form>

      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
        <h2 className="text-2xl font-black">Daftar event</h2>
        <div className="mt-5 space-y-3">{events.length?events.map(item=><article key={item.id} className="rounded-2xl border border-white/10 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-xs text-zinc-500">{item.eventId} · {new Date(item.date).toLocaleString("id-ID")}</p><p className="mt-1 text-xs text-zinc-500">{item.game||"Community"} · {item.route||"Route TBD"}</p></div><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">{item.status}</span></div></article>):<p className="text-zinc-500">Belum ada data event.</p>}</div>
      </section>
    </div>
  </main>;
}