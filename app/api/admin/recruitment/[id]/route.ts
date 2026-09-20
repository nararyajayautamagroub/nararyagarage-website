import {NextResponse} from "next/server";
import {z} from "zod";
import {requireRole} from "@/lib/authorization";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({status:z.enum(["PENDING","REVIEWING","ACCEPTED","REJECTED","WITHDRAWN"] )});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const {id}=await params;
    const body=schema.parse(await req.json());
    const data=await prisma.recruitmentApplication.update({
      where:{id},
      data:{status:body.status,reviewerId:auth.session.user.id,reviewedAt:new Date()},
      select:{id:true,status:true,reviewedAt:true}
    });
    await logActivity({userId:auth.session.user.id,action:"RECRUITMENT_STATUS_UPDATE",entityType:"RecruitmentApplication",entityId:id,metadata:{status:body.status}});
    return NextResponse.json({data});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid status":"Application not found"},{status:400});
  }
}