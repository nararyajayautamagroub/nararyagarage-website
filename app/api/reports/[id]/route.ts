import {rejectCrossOrigin} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";

const schema=z.object({status:z.enum(["REPORT","REVIEW","INVESTIGATION","ACTION","CLOSED"])});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req); if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN","STAFF","MODERATOR"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;
  try{
    const body=schema.parse(await req.json());
    const report=await prisma.report.update({where:{id},data:{status:body.status}});
    return NextResponse.json({data:report});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid status":"Report not found"},{status:error instanceof z.ZodError?400:404});
  }
}