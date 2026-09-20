import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const data=await prisma.member.findMany({
      orderBy:{joinedAt:"desc"},
      take:200,
      select:{
        id:true,
        memberId:true,
        platformId:true,
        game:true,
        role:true,
        status:true,
        joinedAt:true,
        user:{select:{id:true,username:true,displayName:true,email:true,avatarUrl:true,role:true,emailVerifiedAt:true}}
      }
    });
    return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}
}