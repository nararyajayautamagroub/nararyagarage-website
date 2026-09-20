import {NextResponse} from "next/server";
import {z} from "zod";
import {requireRole} from "@/lib/authorization";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({status:z.enum(["PENDING","REVIEWING","APPROVED","REJECTED","PUBLISHED","ARCHIVED"])});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN","STAFF","MODERATOR"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const {id}=await params;
    const body=schema.parse(await req.json());
    const data=await prisma.fleetVehicle.update({where:{id},data:{status:body.status},select:{id:true,name:true,status:true}});
    await logActivity({userId:auth.session.user.id,action:"FLEET_STATUS_UPDATE",entityType:"FleetVehicle",entityId:id,metadata:{status:body.status}});
    return NextResponse.json({data});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid status":"Fleet item not found"},{status:400});
  }
}