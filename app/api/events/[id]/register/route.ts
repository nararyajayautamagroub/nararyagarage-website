import {rejectCrossOrigin} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(_req); if(originError)return originError;
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;

  try{
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true,status:true}});
    if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
    if(member.status!=="ACTIVE")return NextResponse.json({error:"Member tidak aktif"},{status:403});

    const event=await prisma.event.findUnique({where:{id},select:{id:true,name:true,status:true,quota:true}});
    if(!event)return NextResponse.json({error:"Event not found"},{status:404});
    if(event.status!=="OPEN")return NextResponse.json({error:"Event tidak sedang dibuka untuk registrasi"},{status:409});

    const result=await prisma.$transaction(async tx=>{
      const existing=await tx.eventParticipant.findUnique({where:{eventId_memberId:{eventId:id,memberId:member.id}}});
      if(existing&&existing.status!=="CANCELLED")return {already:true};
      const activeCount=await tx.eventParticipant.count({where:{eventId:id,status:{not:"CANCELLED"}}});
      if(event.quota!==null&&activeCount>=event.quota)return {full:true};
      await tx.eventParticipant.upsert({
        where:{eventId_memberId:{eventId:id,memberId:member.id}},
        create:{eventId:id,memberId:member.id,status:"REGISTERED"},
        update:{status:"REGISTERED",registeredAt:new Date()}
      });
      if(event.quota!==null&&activeCount+1>=event.quota){
        await tx.event.update({where:{id},data:{status:"FULL"}});
      }
      return {registered:true};
    });

    if("full" in result&&result.full)return NextResponse.json({error:"Kuota event sudah penuh"},{status:409});
    return NextResponse.json({registered:true,already:"already" in result&&result.already,eventId:id,name:event.name});
  }catch{return NextResponse.json({error:"Event registration failed"},{status:500});}
}

export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;

  try{
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true}});
    if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
    const existing=await prisma.eventParticipant.findUnique({where:{eventId_memberId:{eventId:id,memberId:member.id}}});
    if(!existing||existing.status==="CANCELLED")return NextResponse.json({registered:false});
    await prisma.eventParticipant.update({where:{eventId_memberId:{eventId:id,memberId:member.id}},data:{status:"CANCELLED"}});
    const event=await prisma.event.findUnique({where:{id},select:{status:true}});
    if(event?.status==="FULL")await prisma.event.update({where:{id},data:{status:"OPEN"}});
    return NextResponse.json({registered:false});
  }catch{return NextResponse.json({error:"Event cancellation failed"},{status:500});}
}