import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false,generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
  try{
    const rows=await prisma.member.findMany({
      where:{status:"ACTIVE"},
      orderBy:{joinedAt:"desc"},
      take:200,
      select:{
        memberId:true,
        platformId:true,
        game:true,
        role:true,
        status:true,
        joinedAt:true,
        privacy:true,
        user:{select:{username:true,displayName:true,avatarUrl:true}}
      }
    });

    const data=rows
      .filter(member=>{
        const privacy=member.privacy&&typeof member.privacy==="object"&&!Array.isArray(member.privacy)?member.privacy as Record<string,unknown>:{};
        return privacy.profileVisibility!==false;
      })
      .map(member=>({
        memberId:member.memberId,
        platformId:member.platformId,
        game:member.game,
        role:member.role,
        status:member.status,
        joinedAt:member.joinedAt,
        user:member.user
      }));

    return NextResponse.json({data,configured:true,generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({error:"Database unavailable"},{status:503});
  }
}
