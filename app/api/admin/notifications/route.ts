import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({
  memberId:z.string().min(1).optional(),
  title:z.string().trim().min(2).max(160),
  body:z.string().trim().min(2).max(5000),
  channel:z.string().trim().min(2).max(40).default("WEBSITE")
});

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[]});
  try{
    const data=await prisma.notification.findMany({
      orderBy:{createdAt:"desc"},
      take:200,
      select:{id:true,memberId:true,title:true,body:true,channel:true,readAt:true,createdAt:true}
    });
    return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}
}

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});

  try{
    const body=schema.parse(await req.json());
    let count=0;

    if(body.memberId){
      const member=await prisma.member.findUnique({where:{id:body.memberId},select:{id:true}});
      if(!member)return NextResponse.json({error:"Member not found"},{status:404});
      await prisma.notification.create({data:{memberId:member.id,title:body.title,body:body.body,channel:body.channel}});
      count=1;
    }else{
      const members=await prisma.member.findMany({where:{status:"ACTIVE"},select:{id:true}});
      if(members.length){
        await prisma.notification.createMany({
          data:members.map(member=>({memberId:member.id,title:body.title,body:body.body,channel:body.channel}))
        });
        count=members.length;
      }
    }

    await logActivity({
      userId:auth.session.user.id,
      action:"ADMIN_NOTIFICATION_CREATE",
      entityType:"Notification",
      metadata:{memberId:body.memberId??"BROADCAST",count,channel:body.channel}
    });

    return NextResponse.json({created:count},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid notification":"Notification failed"},{status:400});
  }
}