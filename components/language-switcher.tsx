"use client";

import {useEffect,useState} from "react";
import {DEFAULT_LOCALE,LOCALE_COOKIE,locales,type Locale} from "@/lib/i18n";

function readLocale():Locale{
  if(typeof document==="undefined")return DEFAULT_LOCALE;
  const match=document.cookie.match(new RegExp("(?:^|; )"+LOCALE_COOKIE+"=([^;]*)"));
  const value=match?decodeURIComponent(match[1]):DEFAULT_LOCALE;
  return locales.some(item=>item.code===value)?value:DEFAULT_LOCALE;
}

export function LanguageSwitcher(){
  const [locale,setLocale]=useState<Locale>(DEFAULT_LOCALE);
  useEffect(()=>setLocale(readLocale()),[]);

  function change(next:Locale){
    document.cookie=LOCALE_COOKIE+"="+encodeURIComponent(next)+"; path=/; max-age=31536000; samesite=lax";
    setLocale(next);
    window.location.reload();
  }

  return <label className="inline-flex items-center gap-2 rounded-xl border border-orange-500 bg-white px-3 py-2 text-xs font-bold text-orange-700">
    <span className="sr-only">Language</span>
    <select value={locale} onChange={event=>change(event.target.value as Locale)} className="bg-transparent outline-none">
      {locales.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}
    </select>
  </label>;
}
