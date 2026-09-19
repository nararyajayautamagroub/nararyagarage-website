"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export function EventRegisterButton({eventId}:{eventId:string}){
  const router=useRouter();
  const [registered,setRegistered]=useState(false);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");

  async function toggle(){
    setLoading(true);setMessage("");
    try{
      const res=await fetch(`/api/events/${encodeURIComponent(eventId)}/register`,{method:registered?"DELETE":"POST"});
      const data=await res.json().catch(()=>({}));
      if(res.status===401){router.push(`/login?next=/events`);return;}
      if(!res.ok)throw new Error(data.error||"Registrasi event gagal");
      setRegistered(!registered);
      setMessage(registered?"Registrasi dibatalkan.":"Berhasil terdaftar.");
      router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:"Operasi gagal");}
    finally{setLoading(false);}
  }

  return <div className="mt-5">
    <button type="button" disabled={loading} onClick={toggle} className={registered?"ng-orange-outline w-full":"ng-orange-button w-full"}>
      {loading?"Memproses...":registered?"BATALKAN REGISTRASI":"DAFTAR EVENT"}
    </button>
    {message&&<p className="mt-2 text-center text-xs text-zinc-500" aria-live="polite">{message}</p>}
  </div>;
}