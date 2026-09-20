import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {listOwnedRepositories} from "@/lib/github";
import {requireRole} from "@/lib/authorization";

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  try{
    const [members,activeMembers,events,mods,liveries,showcase,gallery,videos,tutorials,downloads,reports,repositories]=await Promise.all([
      prisma?prisma.member.count():Promise.resolve(0),
      prisma?prisma.member.count({where:{status:"ACTIVE"}}):Promise.resolve(0),
      prisma?prisma.event.count():Promise.resolve(0),
      prisma?prisma.mod.count():Promise.resolve(0),
      prisma?prisma.livery.count():Promise.resolve(0),
      prisma?prisma.showcase.count():Promise.resolve(0),
      prisma?prisma.galleryItem.count():Promise.resolve(0),
      prisma?prisma.video.count():Promise.resolve(0),
      prisma?prisma.tutorial.count():Promise.resolve(0),
      prisma?prisma.download.count():Promise.resolve(0),
      prisma?prisma.report.count({where:{status:{not:"CLOSED"}}}):Promise.resolve(0),
      listOwnedRepositories()
    ]);
    return NextResponse.json({data:{members,activeMembers,events,mods,liveries,showcase,gallery,videos,tutorials,downloads,reports,repositories:repositories.length},generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({error:"Analytics unavailable"},{status:503});
  }
}