import { SectionTitle } from "@/components/cards";
import { Wrench, FileCheck2, Copyright } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cards: Array<[string, LucideIcon, string]> = [
  ["Submission", FileCheck2, "Submit karya untuk moderation sebelum publish."],
  ["Credits", Copyright, "Author, base, edit dan license selalu terlihat."],
  ["Resources", Wrench, "Siapkan resource legal dan versioning yang rapi."],
];

export default function Modding(){
  return <main className="mx-auto max-w-7xl px-6 py-20">
    <SectionTitle eyebrow="Creator area" title="Modding hub" desc="Mod, kodename, livery, texture, 3D, animation, sound dan tools dengan metadata dan credit yang jelas."/>
    <div className="grid gap-4 md:grid-cols-3">{cards.map(([title,Icon,description])=><div key={title} className="rounded-2xl border border-white/10 p-7"><Icon className="text-orange-400"/><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></div>)}</div>
  </main>;
}