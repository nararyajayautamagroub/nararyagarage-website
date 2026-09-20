import {NextResponse} from "next/server";
import {z} from "zod";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";

export const dynamic="force-dynamic";

export async function GET(){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true}});
  if(!member)return NextResponse.json({data:[]});
  const data=await prisma.notification.findMany({
    where:{memberId:member.id},
    orderBy:{createdAt:"desc"},
    take:100,
    select:{id:true,title:true,body:true,channel:true,readAt:true,createdAt:true}
  });
  return NextResponse.json({data});
}

export async function PATCH(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;

  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=z.object({id:z.string().min(1),read:z.boolean().default(true)}).parse(await req.json());
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true}});
    if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
    const notification=await prisma.notification.findFirst({where:{id:body.id,memberId:member.id}});
    if(!notification)return NextResponse.json({error:"Notification not found"},{status:404});
    const updated=await prisma.notification.update({
      where:{id:notification.id},
      data:{readAt:body.read?new Date():null},
      select:{id:true,readAt:true}
    });
    return NextResponse.json({data:updated});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid request":"Failed to update notification"},{status:400});
  }
}