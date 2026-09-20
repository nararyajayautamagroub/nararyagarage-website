"use client";

import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";
import {useRouter} from "next/navigation";

const oauthMessages:Record<string,string>={
  oauth_state:"Sesi OAuth tidak valid. Ulangi login.",
  google_denied:"Login Google dibatalkan.",
  google_not_configured:"Google Login belum dikonfigurasi oleh administrator.",
  google_failed:"Login Google gagal. Coba lagi.",
  verification_expired:"Link verifikasi tidak valid atau sudah kedaluwarsa.",
  verification_token:"Token verifikasi tidak ditemukan.",
  database:"Database belum tersedia."
};

export default function LoginPage(){
  const router=useRouter();
  const [nextPath,setNextPath]=useState("/member");
  const [identifier,setIdentifier]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const code=params.get("error");
    const next=params.get("next");
    setNextPath(next&&next.startsWith("/")&&!next.startsWith("//")?next:"/member");
    if(code)setError(oauthMessages[code]||"Login gagal.");
  },[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError("");setLoading(true);
    try{
      const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||"Login gagal");
      router.push(nextPath);
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:"Login gagal");
    }finally{setLoading(false);}
  }

  return <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-6 py-16">
    <form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-xl">
      <p className="text-xs font-black tracking-[.25em] text-orange-400">NARARYA GARAGE</p>
      <h1 className="mt-2 text-3xl font-black">Masuk</h1>
      <p className="mt-2 text-sm text-zinc-400">Login dengan akun lokal atau Google.</p>

      <a href={"/api/auth/google?next="+encodeURIComponent(nextPath)} className="ng-orange-outline mt-6 w-full">CONTINUE WITH GOOGLE</a>
      <div className="my-5 flex items-center gap-3 text-xs text-zinc-600"><span className="h-px flex-1 bg-white/10"/><span>ATAU</span><span className="h-px flex-1 bg-white/10"/></div>

      <label className="block text-sm font-bold">Email atau username<input required value={identifier} onChange={e=>setIdentifier(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" /></label>
      <label className="mt-4 block text-sm font-bold">Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" /></label>
      {error&&<p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button disabled={loading} className="ng-orange-button mt-6 w-full">{loading?"Memproses...":"MASUK"}</button>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
        <Link href="/forgot-password" className="font-bold text-orange-400">Lupa password?</Link>
        <span>·</span>
        <Link href="/register" className="font-bold text-orange-400">Daftar</Link>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-600"><Link href="/verify-email" className="hover:text-zinc-300">Kirim ulang verifikasi email</Link></p>
    </form>
  </main>;
}
