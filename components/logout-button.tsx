"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export function LogoutButton(){
  const router=useRouter();
  const [loading,setLoading]=useState(false);
  async function logout(){
    setLoading(true);
    try{
      await fetch("/api/auth/logout",{method:"POST"});
      router.push("/");
      router.refresh();
    }finally{setLoading(false);}
  }
  return <button type="button" disabled={loading} onClick={logout} className="ng-orange-outline">{loading?"Keluar...":"KELUAR"}</button>;
}