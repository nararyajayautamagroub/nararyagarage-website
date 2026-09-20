import Link from "next/link";
import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {hasRole,ADMIN_ROLES} from "@/lib/authorization";
import {getPrisma} from "@/lib/prisma";

const modules=[
  ["Overview","/admin"],["Members","/admin/members"],["Recruitment","/admin/members"],["Communities","/community"],
  ["Platforms","/platforms"],["Events","/admin/events"],["Convoys","/convoy"],["Fleet","/showcase"],
  ["Mods","/modding"],["Liveries","/liveries"],["3D Showcase","/showcase"],["Gallery","/gallery"],
  ["Videos","/videos"],["Forum","/forum"],["Tutorials","/tutorials"],["Downloads","/downloads"],
  ["Reports","/admin/reports"],["Moderation","/admin/reports"],["News","/news"],["Notifications","/admin/notifications"],
  ["Partners","/partners"],["Achievements","/achievements"],["Analytics","/admin/analytics"],["Logs","/admin/logs"],["Settings","/admin/settings"],
  ["Creator Submission","/submit"]
];

export const dynamic="force-dynamic";

export default async function Admin(){
  const session=await getSession();
  if(!session)redirect("/login?next=/admin");
  if(!hasRole(session.user.role,ADMIN_ROLES))redirect("/");

  const prisma=getPrisma();
  const counts=prisma?await Promise.all([
    prisma.member.count({where:{status:"ACTIVE"}}),
    prisma.event.count(),
    prisma.mod.count({where:{status:"PUBLISHED"}}),
    prisma.livery.count(),
    prisma.showcase.count(),
    prisma.report.count({where:{status:{not:"CLOSED"}}})
  ]).catch(()=>null):null;

  const cards=[
    ["Active Members",counts?.[0]??"—"],
    ["Events",counts?.[1]??"—"],
    ["Published Mods",counts?.[2]??"—"],
    ["Liveries",counts?.[3]??"—"],
    ["Showcase",counts?.[4]??"—"],
    ["Open Reports",counts?.[5]??"—"]
  ];

  return <main className="mx-auto max-w-7xl px-6 py-16">
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black tracking-[.25em] text-orange-400">NARARYA GARAGE</p>
          <h1 className="mt-2 text-4xl font-black">ADMIN CONTROL CENTER</h1>
          <p className="mt-3 text-zinc-400">Masuk sebagai <span className="font-bold text-white">{session.user.displayName}</span> · role <span className="font-bold text-orange-300">{session.user.role}</span>.</p>
        </div>
        <Link href="/" className="ng-orange-outline inline-flex w-fit">Kembali ke website</Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><p className="text-xs font-bold uppercase tracking-widest text-zinc-600">{label}</p><p className="mt-3 text-3xl font-black text-orange-400">{value}</p></div>)}
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map(([name,href])=><Link href={href} key={name} className="rounded-xl border border-white/10 bg-white/[.03] p-4 font-semibold text-zinc-200 transition hover:border-orange-500/50 hover:bg-orange-500/10">{name}</Link>)}
      </div>
    </div>
  </main>;
}
