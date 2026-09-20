import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  try{
    const data=await prisma.activityLog.findMany({
      orderBy:{createdAt:"desc"},
      take:200,
      select:{id:true,memberId:true,action:true,entityType:true,entityId:true,metadata:true,createdAt:true}
    });
    return NextResponse.json({data,configured:true},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}
}