"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";

type Notification={id:string;title:string;body:string;channel:string;readAt:string|null;createdAt:string};

export default function Notifications(){
  const router=useRouter();
  const [items,setItems]=useState<Notification[]>([]);
  const [error,setError]=useState("");
  useEffect(()=>{
    fetch("/api/notifications",{cache:"no-store"}).then(async response=>{
      const data=await response.json().catch(()=>({}));
      if(response.status===401){router.push("/login?next=/member/notifications");return;}
      if(!response.ok)throw new Error(data.error||"Gagal memuat notifikasi");
      setItems(data.data||[]);
    }).catch(error=>setError(error instanceof Error?error.message:"Gagal memuat notifikasi"));
  },[router]);

  async function markRead(id:string,read:boolean){
    const response=await fetch("/api/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,read})});
    if(!response.ok)return;
    setItems(current=>current.map(item=>item.id===id?{...item,readAt:read?new Date().toISOString():null}:item));
    router.refresh();
  }

  return <main className="mx-auto max-w-4xl px-6 py-14">
    <p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · NOTIFICATIONS</p>
    <h1 className="mt-2 text-4xl font-black">Notifications</h1>
    {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
    <div className="mt-8 space-y-3">{items.length?items.map(item=><article key={item.id} className={item.readAt?"rounded-2xl border border-white/10 bg-zinc-950 p-5":"rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5"}><div className="flex items-start justify-between gap-4"><div><p className="font-bold">{item.title}</p><p className="mt-2 text-sm text-zinc-400">{item.body}</p><p className="mt-2 text-xs text-zinc-600">{item.channel} · {new Date(item.createdAt).toLocaleString("id-ID")}</p></div><button type="button" className="ng-orange-outline shrink-0" onClick={()=>markRead(item.id,!Boolean(item.readAt))}>{item.readAt?"UNREAD":"READ"}</button></div></article>):<p className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Tidak ada notifikasi.</p>}</div>
  </main>;
}