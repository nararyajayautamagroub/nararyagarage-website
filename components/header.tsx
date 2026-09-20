"use client";

import Link from "next/link";
import {Gamepad2,Menu,X} from "lucide-react";
import {useEffect,useState} from "react";
import {LanguageSwitcher} from "@/components/language-switcher";
import {DEFAULT_LOCALE,LOCALE_COOKIE,isLocale,t,type Locale} from "@/lib/i18n";

const links=[
  ["community","/community"],
  ["events","/events"],
  ["modding","/modding"],
  ["showcase","/showcase"],
  ["forum","/forum"],
  ["news","/news"],
  ["repositories","/repositories"]
] as const;

function readLocale():Locale{
  if(typeof document==="undefined")return DEFAULT_LOCALE;
  const match=document.cookie.match(new RegExp("(?:^|; )"+LOCALE_COOKIE+"=([^;]*)"));
  const value=match?decodeURIComponent(match[1]):DEFAULT_LOCALE;
  return isLocale(value)?value:DEFAULT_LOCALE;
}

export function Header(){
  const [open,setOpen]=useState(false);
  const [locale,setLocale]=useState<Locale>(DEFAULT_LOCALE);

  useEffect(()=>setLocale(readLocale()),[]);

  return <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 text-zinc-950 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-2 font-black tracking-tight" onClick={()=>setOpen(false)}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white shadow-sm"><Gamepad2 size={21}/></span>
        <span className="truncate">NARARYA <span className="text-orange-500">GARAGE</span></span>
      </Link>

      <div className="hidden items-center gap-2 xl:flex">
        <nav aria-label="Navigasi utama" className="flex items-center gap-1 text-sm font-bold">
          {links.map(([key,href])=><Link key={href} href={href} className="rounded-lg px-3 py-2 text-zinc-700 transition hover:bg-orange-50 hover:text-orange-600">{t(locale,key)}</Link>)}
          <Link href="/login" className="ng-orange-outline py-2">LOGIN</Link>
          <Link href="/register" className="ng-orange-button py-2">JOIN</Link>
        </nav>
        <LanguageSwitcher/>
      </div>

      <div className="flex items-center gap-2 xl:hidden">
        <LanguageSwitcher/>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-orange-500 bg-white text-orange-500 lg:hidden"
          onClick={()=>setOpen(value=>!value)}
          aria-label={open?"Tutup menu":"Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open?<X size={23}/>:<Menu size={23}/>}
        </button>
      </div>
    </div>

    {open&&<nav id="mobile-navigation" aria-label="Navigasi mobile" className="border-t border-orange-100 bg-white px-4 pb-5 pt-3 shadow-lg xl:hidden sm:px-6">
      <div className="grid gap-1">
        {links.map(([key,href])=><Link onClick={()=>setOpen(false)} key={href} href={href} className="rounded-xl px-4 py-3 font-semibold text-zinc-700 transition hover:bg-orange-50 hover:text-orange-600">{t(locale,key)}</Link>)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link onClick={()=>setOpen(false)} href="/login" className="ng-orange-outline py-3">LOGIN</Link>
        <Link onClick={()=>setOpen(false)} href="/register" className="ng-orange-button py-3">JOIN</Link>
      </div>
    </nav>}
  </header>;
}
