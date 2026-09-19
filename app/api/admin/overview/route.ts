import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){
 const prisma=getPrisma();
 if(!prisma)return NextResponse.json({configured:false,counts:{}});
 try{
  const [members,events,mods,liveries,showcase,reports]=await Promise.all([
   prisma.member.count(),prisma.event.count(),prisma.mod.count(),prisma.livery.count(),prisma.showcase.count(),prisma.report.count()
  ]);
  return NextResponse.json({configured:true,counts:{members,events,mods,liveries,showcase,reports},generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Database unavailable"},{status:503})}
}