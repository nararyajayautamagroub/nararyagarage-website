"use client";

import Link from "next/link";
import {FormEvent,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";

export default function LoginPage(){
  const router=useRouter();
  const search=useSearchParams();
  const [identifier,setIdentifier]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError("");setLoading(true);
    try{
      const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||"Login gagal");
      router.push(search.get("next")||"/member");
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:"Login gagal");
    }finally{setLoading(false);}
  }

  return <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-6 py-16">
    <form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-2xl">
      <p className="text-xs font-black tracking-[.25em] text-orange-400">NARARYA GARAGE</p>
      <h1 className="mt-2 text-3xl font-black">Masuk</h1>
      <p className="mt-2 text-sm text-zinc-400">Login ke member center dan fitur komunitas.</p>
      <label className="mt-7 block text-sm font-bold">Email atau username<input required value={identifier} onChange={e=>setIdentifier(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" /></label>
      <label className="mt-4 block text-sm font-bold">Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" /></label>
      {error&&<p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button disabled={loading} className="ng-orange-button mt-6 w-full">{loading?"Memproses...":"MASUK"}</button>
      <p className="mt-5 text-center text-sm text-zinc-400">Belum punya akun? <Link href="/register" className="font-bold text-orange-400 hover:text-orange-300">Daftar</Link></p>
    </form>
  </main>;
}