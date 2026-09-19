"use client";

import Link from "next/link";
import {Gamepad2, Menu, X} from "lucide-react";
import {useState} from "react";

const links=[
  ["Community","/community"],
  ["Events","/events"],
  ["Modding","/modding"],
  ["Showcase","/showcase"],
  ["Forum","/forum"],
  ["News","/news"],
  ["Repositories","/repositories"],
];

export function Header(){
  const [open,setOpen]=useState(false);
  return <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 text-zinc-950 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
      <Link href="/" className="flex min-w-0 items-center gap-3 font-black tracking-tight" onClick={()=>setOpen(false)}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white shadow-sm"><Gamepad2 size={21}/></span>
        <span className="truncate">NARARYA <span className="text-orange-500">GARAGE</span></span>
      </Link>

      <nav aria-label="Navigasi utama" className="hidden items-center gap-5 text-sm font-bold lg:flex">
        {links.map(([name,href])=><Link key={href} href={href} className="rounded-lg px-2 py-2 text-zinc-700 transition hover:bg-orange-50 hover:text-orange-600">{name}</Link>)}
        <Link href="/login" className="rounded-xl border border-orange-500 bg-white px-4 py-2 text-orange-600 transition hover:bg-orange-50">LOGIN</Link>
        <Link href="/register" className="rounded-xl bg-orange-500 px-4 py-2 text-white shadow-sm transition hover:bg-orange-400">JOIN</Link>
      </nav>

      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-orange-500 bg-white text-orange-500 transition hover:bg-orange-50 lg:hidden"
        onClick={()=>setOpen(value=>!value)}
        aria-label={open?"Tutup menu":"Buka menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        {open?<X size={23}/>:<Menu size={23}/>}
      </button>
    </div>

    {open&&<nav id="mobile-navigation" aria-label="Navigasi mobile" className="border-t border-orange-100 bg-white px-6 pb-5 pt-3 shadow-lg lg:hidden">
      <div className="grid gap-1">
        {links.map(([name,href])=><Link onClick={()=>setOpen(false)} key={href} href={href} className="rounded-xl px-4 py-3 font-semibold text-zinc-700 transition hover:bg-orange-50 hover:text-orange-600">{name}</Link>)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link onClick={()=>setOpen(false)} href="/login" className="rounded-xl border-2 border-orange-500 bg-white px-4 py-3 text-center font-bold text-orange-600">LOGIN</Link>
        <Link onClick={()=>setOpen(false)} href="/register" className="rounded-xl bg-orange-500 px-4 py-3 text-center font-bold text-white">JOIN</Link>
      </div>
    </nav>}
  </header>;
}