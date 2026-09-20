import {NextResponse} from "next/server";
import {requireRole} from "@/lib/authorization";
import {getPrisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const data=await prisma.recruitmentApplication.findMany({
    orderBy:{createdAt:"desc"},
    take:200,
    select:{id:true,desiredRole:true,motivation:true,experience:true,portfolioUrl:true,status:true,createdAt:true,reviewedAt:true,member:{select:{memberId:true,user:{select:{username:true,displayName:true,email:true}}}}}
  });
  return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
}