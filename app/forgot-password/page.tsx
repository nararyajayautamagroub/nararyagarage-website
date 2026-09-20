"use client";

import {FormEvent,useState} from "react";
import Link from "next/link";

export default function ForgotPasswordPage(){
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setMessage("");
    try{
      const response=await fetch("/api/auth/password/forgot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
      const data=await response.json().catch(()=>({}));
      setMessage(data.message||"Jika akun ada, instruksi reset akan dikirim.");
    }finally{setLoading(false);}
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
    <form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-xl">
      <p className="text-xs font-black tracking-[.25em] text-orange-400">PASSWORD RESET</p>
      <h1 className="mt-2 text-3xl font-black">Lupa password</h1>
      <p className="mt-3 text-sm text-zinc-400">Masukkan email akun untuk menerima link reset.</p>
      <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-6 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
      {message&&<p className="mt-4 rounded-xl bg-orange-500/10 p-3 text-sm text-orange-200">{message}</p>}
      <button disabled={loading} className="ng-orange-button mt-5 w-full">{loading?"Mengirim...":"KIRIM RESET LINK"}</button>
      <p className="mt-5 text-center text-sm text-zinc-400"><Link href="/login" className="text-orange-400">Kembali ke login</Link></p>
    </form>
  </main>;
}
