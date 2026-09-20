"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";

export function EventRegisterButton({eventId}:{eventId:string}){
  const router=useRouter();
  const [registered,setRegistered]=useState(false);
  const [authenticated,setAuthenticated]=useState(false);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    let active=true;
    fetch("/api/events/"+encodeURIComponent(eventId)+"/register",{cache:"no-store"})
      .then(async res=>{
        const data=await res.json().catch(()=>({}));
        if(active&&res.ok){
          setRegistered(Boolean(data.registered));
          setAuthenticated(Boolean(data.authenticated));
        }
      })
      .catch(()=>{})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[eventId]);

  async function toggle(){
    setLoading(true);
    setMessage("");
    try{
      const method=registered?"DELETE":"POST";
      const res=await fetch("/api/events/"+encodeURIComponent(eventId)+"/register",{method});
      const data=await res.json().catch(()=>({}));
      if(res.status===401){
        router.push("/login?next=/events");
        return;
      }
      if(!res.ok)throw new Error(data.error||"Registrasi event gagal");
      setRegistered(!registered);
      setAuthenticated(true);
      setMessage(registered?"Registrasi dibatalkan.":"Berhasil terdaftar.");
      router.refresh();
    }catch(error){
      setMessage(error instanceof Error?error.message:"Operasi gagal");
    }finally{
      setLoading(false);
    }
  }

  return <div className="mt-5">
    <button type="button" disabled={loading} onClick={toggle} className={registered?"ng-orange-outline w-full":"ng-orange-button w-full"}>
      {loading?"Memuat...":registered?"BATALKAN REGISTRASI":"DAFTAR EVENT"}
    </button>
    {authenticated&&registered&&<p className="mt-2 text-center text-xs text-orange-300">Kamu sudah terdaftar di event ini.</p>}
    {message&&<p className="mt-2 text-center text-xs text-zinc-500" aria-live="polite">{message}</p>}
  </div>;
}
