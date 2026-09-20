import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({key:z.string().trim().regex(/^[A-Z0-9_.-]{2,80}$/),value:z.unknown()});
const isSensitiveKey=(key:string)=>/(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY|DATABASE_URL|CREDENTIAL)/i.test(key);

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  const data=await prisma.setting.findMany({orderBy:{key:"asc"}});
  return NextResponse.json({data:data.map(item=>({...item,value:isSensitiveKey(item.key)?"[REDACTED]":item.value}))},{headers:{"Cache-Control":"no-store"}});
}

export async function PATCH(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=schema.parse(await req.json());
    const data=await prisma.setting.upsert({where:{key:body.key},create:{key:body.key,value:body.value},update:{value:body.value}});
    await logActivity({userId:auth.session.user.id,action:"ADMIN_SETTING_UPDATE",entityType:"Setting",entityId:body.key});
    return NextResponse.json({data});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid setting":"Setting update failed"},{status:400});
  }
}