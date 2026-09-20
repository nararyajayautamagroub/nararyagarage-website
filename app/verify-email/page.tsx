"use client";

import {FormEvent,useState} from "react";
import {useSearchParams} from "next/navigation";

export default function VerifyEmailPage(){
  const params=useSearchParams();
  const token=params.get("token");
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState(token?"Link verifikasi akan diproses saat halaman dibuka.":"");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  if(token){
    if(typeof window!=="undefined")window.location.replace("/api/auth/verify?token="+encodeURIComponent(token));
    return <main className="mx-auto max-w-md px-6 py-20 text-center"><p className="text-zinc-500">Memverifikasi email...</p></main>;
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setError("");setMessage("");
    try{
      const response=await fetch("/api/auth/verify/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
      const data=await response.json().catch(()=>({}));
      setMessage(data.message||"Jika akun ada, instruksi verifikasi akan dikirim.");
    }catch{setError("Request verifikasi gagal.");}
    finally{setLoading(false);}
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
    <form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-xl">
      <p className="text-xs font-black tracking-[.25em] text-orange-400">EMAIL VERIFICATION</p>
      <h1 className="mt-2 text-3xl font-black">Verifikasi email</h1>
      <p className="mt-3 text-sm text-zinc-400">Masukkan email akun untuk menerima link verifikasi.</p>
      <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-6 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
      {error&&<p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {message&&<p className="mt-4 rounded-xl bg-orange-500/10 p-3 text-sm text-orange-200">{message}</p>}
      <button disabled={loading} className="ng-orange-button mt-5 w-full">{loading?"Mengirim...":"KIRIM LINK VERIFIKASI"}</button>
    </form>
  </main>;
}
