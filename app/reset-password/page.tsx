"use client";

import {FormEvent,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage(){
  const router=useRouter();
  const [token,setToken]=useState("");
  useEffect(()=>{setToken(new URLSearchParams(window.location.search).get("token")||"");},[]);
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");
    if(password!==confirm){setError("Password tidak sama.");return;}
    setLoading(true);
    try{
      const response=await fetch("/api/auth/password/reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Reset password gagal");
      router.push("/login?reset=1");
    }catch(error){setError(error instanceof Error?error.message:"Reset password gagal");}
    finally{setLoading(false);}
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
    <form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-xl">
      <p className="text-xs font-black tracking-[.25em] text-orange-400">PASSWORD RESET</p>
      <h1 className="mt-2 text-3xl font-black">Password baru</h1>
      <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password baru" className="mt-6 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
      <input required minLength={8} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Ulangi password" className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>
      {error&&<p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <button disabled={loading||!token} className="ng-orange-button mt-5 w-full">{loading?"Menyimpan...":"SIMPAN PASSWORD"}</button>
      <p className="mt-5 text-center text-sm text-zinc-400"><Link href="/login" className="text-orange-400">Kembali ke login</Link></p>
    </form>
  </main>;
}
