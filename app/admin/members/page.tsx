"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Member={
  id:string;
  memberId:string;
  platformId:string|null;
  game:string|null;
  role:string;
  status:string;
  joinedAt:string;
  user:{id:string;username:string;displayName:string;email:string;avatarUrl:string|null;role:string;emailVerifiedAt:string|null}
};

const statuses=["ACTIVE","INACTIVE","ON_LEAVE","SUSPENDED","BANNED","RESIGNED"];

export default function AdminMembers(){
  const [members,setMembers]=useState<Member[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  async function load(){
    const res=await fetch("/api/admin/members",{cache:"no-store"});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||"Gagal memuat member");
    setMembers(data.data||[]);
  }

  useEffect(()=>{load().catch(error=>setError(error instanceof Error?error.message:"Gagal memuat member")).finally(()=>setLoading(false));},[]);

  async function updateStatus(id:string,status:string){
    setError("");
    const res=await fetch(`/api/admin/members/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok){setError(data.error||"Update member gagal");return;}
    setMembers(current=>current.map(member=>member.id===id?{...member,status}:member));
  }

  return <main className="mx-auto max-w-7xl px-6 py-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-black tracking-[.25em] text-orange-400">ADMIN · MEMBERS</p><h1 className="mt-2 text-4xl font-black">Member management</h1><p className="mt-3 text-zinc-400">Directory, status, role komunitas, platform dan verifikasi akun.</p></div>
      <Link href="/admin" className="ng-orange-outline inline-flex w-fit">KEMBALI ADMIN</Link>
    </div>

    {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
    <section className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-zinc-950">
      {loading?<p className="p-7 text-zinc-500">Memuat member...</p>:members.length?<table className="w-full min-w-[920px] text-left text-sm">
        <thead><tr className="border-b border-white/10 text-zinc-500"><th className="p-4">Member</th><th>Status</th><th>Role</th><th>Platform</th><th>Game</th><th>Bergabung</th></tr></thead>
        <tbody>{members.map(member=><tr key={member.id} className="border-b border-white/5">
          <td className="p-4"><p className="font-bold">{member.user.displayName}</p><p className="mt-1 text-xs text-zinc-600">@{member.user.username} · {member.memberId}</p></td>
          <td className="p-4"><select value={member.status} onChange={e=>updateStatus(member.id,e.target.value)} className="rounded-xl border border-orange-500 bg-white px-3 py-2 font-bold text-orange-700">{statuses.map(status=><option key={status}>{status}</option>)}</select></td>
          <td className="p-4">{member.role}<p className="text-xs text-zinc-600">account: {member.user.role}</p></td>
          <td className="p-4">{member.platformId||"—"}</td>
          <td className="p-4">{member.game||"—"}</td>
          <td className="p-4 text-zinc-500">{new Date(member.joinedAt).toLocaleDateString("id-ID")}</td>
        </tr>)}</tbody>
      </table>:<p className="p-7 text-zinc-500">Belum ada member.</p>}
    </section>
  </main>;
}