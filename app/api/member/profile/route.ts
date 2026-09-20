import {NextResponse} from "next/server";
import {z} from "zod";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({
  displayName:z.string().trim().min(2).max(80).optional(),
  avatarUrl:z.string().url().max(2000).nullable().optional(),
  platformId:z.string().trim().max(80).nullable().optional(),
  game:z.string().trim().max(80).nullable().optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const member=await prisma.member.findUnique({
    where:{userId:session.user.id},
    select:{memberId:true,platformId:true,game:true,role:true,status:true,joinedAt:true,user:{select:{username:true,displayName:true,email:true,avatarUrl:true}}}
  });
  if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
  return NextResponse.json({data:member},{headers:{"Cache-Control":"no-store"}});
}

export async function PATCH(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=schema.parse(await req.json());
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true}});
    if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
    const updated=await prisma.$transaction(async tx=>{
      if(body.displayName!==undefined||body.avatarUrl!==undefined){
        await tx.user.update({
          where:{id:session.user.id},
          data:{
            ...(body.displayName!==undefined?{displayName:body.displayName}:{}),
            ...(body.avatarUrl!==undefined?{avatarUrl:body.avatarUrl}: {})
          }
        });
      }
      return tx.member.update({
        where:{id:member.id},
        data:{
          ...(body.platformId!==undefined?{platformId:body.platformId}:{}),
          ...(body.game!==undefined?{game:body.game}: {})
        },
        select:{memberId:true,platformId:true,game:true,role:true,status:true,joinedAt:true}
      });
    });
    await logActivity({userId:session.user.id,action:"MEMBER_PROFILE_UPDATE",entityType:"Member",entityId:member.id});
    return NextResponse.json({data:updated});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid profile data":"Profile update failed"},{status:400});
  }
}