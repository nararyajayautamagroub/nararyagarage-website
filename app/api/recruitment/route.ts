import {NextResponse} from "next/server";
import {z} from "zod";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({
  desiredRole:z.string().trim().min(2).max(80),
  motivation:z.string().trim().min(20).max(5000),
  experience:z.string().trim().max(5000).nullable().optional(),
  portfolioUrl:z.string().url().max(2000).nullable().optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true}});
  if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
  const data=await prisma.recruitmentApplication.findMany({
    where:{memberId:member.id},
    orderBy:{createdAt:"desc"},
    take:50,
    select:{id:true,desiredRole:true,motivation:true,experience:true,portfolioUrl:true,status:true,createdAt:true,reviewedAt:true}
  });
  return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
}

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=schema.parse(await req.json());
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true,status:true}});
    if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
    if(member.status!=="ACTIVE")return NextResponse.json({error:"Member tidak aktif"},{status:403});
    const active=await prisma.recruitmentApplication.findFirst({where:{memberId:member.id,status:{in:["PENDING","REVIEWING"]}},select:{id:true}});
    if(active)return NextResponse.json({error:"Masih ada lamaran yang sedang diproses"},{status:409});
    const data=await prisma.recruitmentApplication.create({
      data:{memberId:member.id,desiredRole:body.desiredRole,motivation:body.motivation,experience:body.experience??null,portfolioUrl:body.portfolioUrl??null},
      select:{id: true, desiredRole:true, status:true, createdAt:true}
    });
    await logActivity({userId:session.user.id,action:"RECRUITMENT_APPLICATION_CREATE",entityType:"RecruitmentApplication",entityId:data.id});
    return NextResponse.json({data},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid recruitment data":"Recruitment submission failed"},{status:400});
  }
}