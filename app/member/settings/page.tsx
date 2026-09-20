"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

type SettingKey =
  | "emailNotifications"
  | "discordNotifications"
  | "whatsappNotifications"
  | "profileVisibility"
  | "activityVisibility";

type Prefs = Record<SettingKey, boolean>;

const keys: SettingKey[] = [
  "emailNotifications",
  "discordNotifications",
  "whatsappNotifications",
  "profileVisibility",
  "activityVisibility"
];

const labels: Record<SettingKey,string> = {
  emailNotifications:"Email notifications",
  discordNotifications:"Discord notifications",
  whatsappNotifications:"WhatsApp notifications",
  profileVisibility:"Profile visibility",
  activityVisibility:"Activity visibility"
};

const defaults: Prefs = {
  emailNotifications:true,
  discordNotifications:false,
  whatsappNotifications:false,
  profileVisibility:true,
  activityVisibility:true
};

export default function Settings(){
  const [prefs,setPrefs] = useState<Prefs>(defaults);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");

  useEffect(() => {
    fetch("/api/member/settings",{cache:"no-store"})
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if(response.status === 401){
          window.location.href = "/login?next=/member/settings";
          return;
        }
        if(!response.ok) throw new Error(data.error || "Gagal memuat settings");
        setPrefs({...defaults,...data.data});
      })
      .catch(error => setError(error instanceof Error ? error.message : "Gagal memuat settings"));
  },[]);

  async function toggle(key:SettingKey){
    const response = await fetch("/api/member/settings",{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({[key]:!prefs[key]})
    });
    const data = await response.json().catch(() => ({}));
    if(!response.ok){
      setError(data.error || "Gagal memperbarui settings");
      return;
    }
    setError("");
    setMessage("Settings tersimpan.");
    setPrefs({...prefs,...data.data});
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[.25em] text-orange-400">MEMBER · SETTINGS</p>
          <h1 className="mt-2 text-4xl font-black">Settings</h1>
        </div>
        <Link href="/member" className="ng-orange-outline">MEMBER CENTER</Link>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
      {message && <p className="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200">{message}</p>}

      <div className="mt-8 space-y-3">
        {keys.map(key => (
          <button
            type="button"
            key={key}
            onClick={() => toggle(key)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 p-5 text-left"
          >
            <span className="font-semibold">{labels[key]}</span>
            <span className={prefs[key]
              ? "rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white"
              : "rounded-full bg-white/10 px-3 py-1 text-xs font-black text-zinc-500"}
            >
              {prefs[key] ? "ON" : "OFF"}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
