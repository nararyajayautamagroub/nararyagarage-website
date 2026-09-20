"use client";

import {FormEvent,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

type Profile={memberId:string;platformId:string|null;game:string|null;role:string;status:string;joinedAt:string;user:{username:string;displayName:string;email:string;avatarUrl:string|null}};

export default function Profile(){
  const router=useRouter();
  const [data,setData]=useState<Profile|null>(null);
  const [form,setForm]=useState({displayName:"",avatarUrl:"",platformId:"",game:""});
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    fetch("/api/member/profile",{cache:"no-store"}).then(async response=>{
      const payload=await response.json().catch(()=>({}));
      if(response.status===401){router.push("/login?next=/member/profile");return;}
      if(!response.ok)throw new Error(payload.error||"Gagal memuat profil");
      setData(payload.data);
      setForm({
        displayName:payload.data.user.displayName||"",
        avatarUrl:payload.data.user.avatarUrl||"",
        platformId:payload.data.platformId||"",
        game:payload.data.game||""
      });
    }).catch(error=>setError(error instanceof Error?error.message:"Gagal memuat profil"))
      .finally(()=>setLoading(false));
  },[router]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError("");setMessage("");
    const response=await fetch("/api/member/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,avatarUrl:form.avatarUrl||null,platformId:form.platformId||null,game:form.game||null})});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok){setError(payload.error||"Gagal menyimpan profil");return;}
    setMessage("Profil berhasil diperbarui.");
    router.refresh();
  }

  if(loading)return <main className="mx-auto max-w-3xl px-6 py-16"><p className="text-zinc-500">Memuat profil...</p></main>;

  return <main className="mx-auto max-w-3xl px-6 py-14">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · PROFILE</p><h1 className="mt-2 text-4xl font-black">My Profile</h1></div><Link href="/member" className="ng-orange-outline">MEMBER CENTER</Link></div>
    {data&&<div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><p className="text-xs text-zinc-600">Member ID</p><p className="mt-2 font-bold">{data.memberId}</p></div><div className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><p className="text-xs text-zinc-600">Role</p><p className="mt-2 font-bold">{data.role}</p></div><div className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><p className="text-xs text-zinc-600">Status</p><p className="mt-2 font-bold text-orange-300">{data.status}</p></div></div>}
    <form onSubmit={save} className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <label className="block text-sm font-bold">Username<input disabled value={data?.user.username||""} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-zinc-500"/></label>
      <label className="mt-4 block text-sm font-bold">Email<input disabled value={data?.user.email||""} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-zinc-500"/></label>
      <label className="mt-4 block text-sm font-bold">Display Name<input required value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
      <label className="mt-4 block text-sm font-bold">Avatar URL<input type="url" value={form.avatarUrl} onChange={e=>setForm({...form,avatarUrl:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Platform<input value={form.platformId} onChange={e=>setForm({...form,platformId:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label><label className="text-sm font-bold">Game<input value={form.game} onChange={e=>setForm({...form,game:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label></div>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
      {message&&<p className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200">{message}</p>}
      <button className="ng-orange-button mt-6 w-full">SIMPAN PROFILE</button>
    </form>
  </main>;
}