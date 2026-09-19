"use client";
import Link from "next/link";
import {Menu, X, Gamepad2} from "lucide-react";
import {useState} from "react";

const links=[["Community","/community"],["Events","/events"],["Modding","/modding"],["Showcase","/showcase"],["Forum","/forum"],["News","/news"]];

export function Header(){
 const [open,setOpen]=useState(false);
 return <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
   <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500"><Gamepad2 size={21}/></span><span>NARARYA <span className="text-orange-400">GARAGE</span></span></Link>
   <nav className="hidden gap-6 text-sm font-semibold md:flex">{links.map(([n,h])=><Link key={h} href={h} className="text-zinc-300 hover:text-white">{n}</Link>)}</nav>
   <button className="md:hidden" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
  </div>
  {open&&<nav className="grid gap-1 border-t border-white/10 px-6 py-4 md:hidden">{links.map(([n,h])=><Link onClick={()=>setOpen(false)} key={h} href={h} className="rounded-lg px-3 py-3 text-zinc-300 hover:bg-white/5">{n}</Link>)}</nav>}
 </header>
}