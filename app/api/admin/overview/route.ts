import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole();
  if(!auth.ok)return auth.response;

  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({configured:false,counts:{}},{headers:{"Cache-Control":"no-store"}});

  try{
    const [members,events,mods,liveries,showcase,reports]=await Promise.all([
      prisma.member.count(),
      prisma.event.count(),
      prisma.mod.count(),
      prisma.livery.count(),
      prisma.showcase.count(),
      prisma.report.count()
    ]);
    return NextResponse.json(
      {configured:true,counts:{members,events,mods,liveries,showcase,reports},generatedAt:new Date().toISOString()},
      {headers:{"Cache-Control":"no-store"}}
    );
  }catch{
    return NextResponse.json({error:"Database unavailable"},{status:503});
  }
}