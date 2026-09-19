"use client";

import {useEffect} from "react";

export default function GlobalError({reset}:{error:Error & {digest?:string};reset:()=>void}){
  useEffect(()=>{console.error("NARARYA GARAGE application error",error)},[error]);
  return <main className="grid min-h-[70vh] place-items-center px-6 py-20">
    <div className="max-w-xl rounded-3xl border border-red-500/20 bg-zinc-950 p-8 text-center">
      <p className="text-sm font-black tracking-[.2em] text-orange-400">NARARYA GARAGE</p>
      <h1 className="mt-3 text-3xl font-black">Terjadi kesalahan saat memuat halaman.</h1>
      <p className="mt-4 text-zinc-400">Error ditangani di boundary ini supaya seluruh situs tidak ikut tumbang.</p>
      <button type="button" onClick={()=>reset()} className="mt-7 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-400">Coba lagi</button>
    </div>
  </main>;
}