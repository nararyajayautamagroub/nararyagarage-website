import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({status:z.enum(["PENDING","REVIEWING","APPROVED","REJECTED","PUBLISHED","ARCHIVED"])});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN","STAFF","MODERATOR"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;
  try{
    const body=schema.parse(await req.json());
    const mod=await prisma.mod.update({where:{id},data:{status:body.status},select:{id:true,name:true,status:true,createdAt:true}});
    return NextResponse.json({data:mod});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid status":"Mod not found"},{status:error instanceof z.ZodError?400:404});
  }
}