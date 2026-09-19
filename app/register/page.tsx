"use client";

import Link from "next/link";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";

export default function RegisterPage(){
  const router=useRouter();
  const [form,setForm]=useState({email:"",username:"",displayName:"",password:""});
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  function change(key:keyof typeof form,value:string){setForm(current=>({...current,[key]:value}));}

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setLoading(true);
    try{
      const res=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||"Pendaftaran gagal");
      router.push("/member");router.refresh();
    }catch(error){setError(error instanceof Error?error.message:"Pendaftaran gagal");}
    finally{setLoading(false);}
  }

  return <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-6 py-16">
    <form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-2xl">
      <p className="text-xs font-black tracking-[.25em] text-orange-400">JOIN THE GARAGE</p>
      <h1 className="mt-2 text-3xl font-black">Buat akun member</h1>
      <p className="mt-2 text-sm text-zinc-400">Satu akun untuk komunitas, event, forum, showcase, dan aktivitas member.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold sm:col-span-2">Nama tampil<input required minLength={2} maxLength={80} value={form.displayName} onChange={e=>change("displayName",e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500" /></label>
        <label className="text-sm font-bold">Username<input required pattern="[A-Za-z0-9_]{3,32}" value={form.username} onChange={e=>change("username",e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500" /></label>
        <label className="text-sm font-bold">Email<input required type="email" value={form.email} onChange={e=>change("email",e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500" /></label>
        <label className="text-sm font-bold sm:col-span-2">Password<input required minLength={8} maxLength={128} type="password" value={form.password} onChange={e=>change("password",e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500" /></label>
      </div>
      {error&&<p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button disabled={loading} className="ng-orange-button mt-6 w-full">{loading?"Membuat akun...":"BUAT AKUN"}</button>
      <p className="mt-5 text-center text-sm text-zinc-400">Sudah punya akun? <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300">Masuk</Link></p>
    </form>
  </main>;
}