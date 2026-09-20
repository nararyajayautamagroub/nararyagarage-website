"use client";

import Link from "next/link";
import {FormEvent,useState} from "react";

type Kind="mods"|"liveries"|"showcase";

const defaults={
  mods:{name:"",platform:"BUSSID",game:"",version:"",description:"",screenshotUrl:"",credits:"",license:"",downloadUrl:""},
  liveries:{name:"",vehicle:"",platform:"BUSSID",game:"",screenshotUrl:"",credits:""},
  showcase:{type:"Vehicle",title:"",description:"",previewUrl:"",credits:"",license:""}
};

export default function SubmitPage(){
  const [kind,setKind]=useState<Kind>("mods");
  const [form,setForm]=useState<Record<string,string>>({...defaults.mods});
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  function switchKind(next:Kind){
    setKind(next);
    setForm({...defaults[next]});
    setMessage("");
    setError("");
  }

  function change(key:string,value:string){setForm(current=>({...current,[key]:value}));}

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try{
      const res=await fetch(`/api/${kind}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form)
      });
      const data=await res.json().catch(()=>({}));
      if(res.status===401){
        window.location.href="/login?next=/submit";
        return;
      }
      if(!res.ok)throw new Error(data.error||"Submission gagal");
      setMessage("Submission berhasil dikirim untuk diproses.");
      setForm({...defaults[kind]});
    }catch(error){
      setError(error instanceof Error?error.message:"Submission gagal");
    }finally{
      setLoading(false);
    }
  }

  const fields=kind==="mods"
    ? [["name","Nama mod"],["platform","Platform"],["game","Game"],["version","Version"],["description","Deskripsi"],["screenshotUrl","Screenshot URL"],["credits","Credits"],["license","License"],["downloadUrl","Download URL"]]
    : kind==="liveries"
      ? [["name","Nama livery"],["vehicle","Kendaraan"],["platform","Platform"],["game","Game"],["screenshotUrl","Screenshot URL"],["credits","Credits"]]
      : [["type","Jenis showcase"],["title","Judul"],["description","Deskripsi"],["previewUrl","Preview URL"],["credits","Credits"],["license","License"]];

  return <main className="mx-auto max-w-3xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-black tracking-[.25em] text-orange-400">CREATOR AREA</p><h1 className="mt-2 text-4xl font-black">SUBMIT KARYA</h1><p className="mt-3 text-zinc-400">Kirim mod, livery, atau showcase menggunakan akun member.</p></div>
      <Link href="/member" className="ng-orange-outline inline-flex w-fit">MEMBER CENTER</Link>
    </div>

    <div className="mt-8 grid grid-cols-3 rounded-2xl border border-white/10 bg-zinc-950 p-1">
      {([["mods","MOD"],["liveries","LIVERY"],["showcase","SHOWCASE"]] as [Kind,string][]).map(([value,label])=><button type="button" key={value} onClick={()=>switchKind(value)} className={kind===value?"ng-orange-button":"rounded-xl px-4 py-3 font-bold text-zinc-400 transition hover:bg-white/5"}>{label}</button>)}
    </div>

    <form onSubmit={submit} className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-7">
      <div className="grid gap-4">
        {fields.map(([key,label])=><label key={key} className="text-sm font-bold">{label}{["description","credits"].includes(key)?<textarea required={key==="description"} value={form[key]||""} onChange={e=>change(key,e.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>:<input required={["name","vehicle","title"].includes(key)} value={form[key]||""} onChange={e=>change(key,e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/>}</label>)}
      </div>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {message&&<p className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">{message}</p>}
      <button disabled={loading} className="ng-orange-button mt-6 w-full">{loading?"Mengirim...":"KIRIM SUBMISSION"}</button>
    </form>
  </main>;
}