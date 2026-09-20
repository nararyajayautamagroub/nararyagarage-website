import {rejectCrossOrigin} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {z} from "zod";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";

const schema=z.object({
  targetType:z.string().trim().min(2).max(40),
  targetId:z.string().trim().min(1).max(100),
  reason:z.string().trim().min(5).max(2000)
});

export const dynamic="force-dynamic";

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req); if(originError)return originError;
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});

  try{
    const body=schema.parse(await req.json());
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true}});
    const report=await prisma.report.create({
      data:{reporterId:member?.id??null,targetType:body.targetType,targetId:body.targetId,reason:body.reason},
      select:{id:true,status:true,createdAt:true}
    });
    return NextResponse.json({data:report},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid report":"Failed to create report"},{status:400});
  }
}

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF","MODERATOR"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const data=await prisma.report.findMany({orderBy:{createdAt:"desc"},take:100});
    return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}
}