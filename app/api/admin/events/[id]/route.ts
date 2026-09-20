import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({
  name:z.string().trim().min(3).max(160).optional(),
  type:z.string().trim().min(2).max(60).optional(),
  game:z.string().trim().max(80).nullable().optional(),
  date:z.string().datetime().optional(),
  host:z.string().trim().max(120).nullable().optional(),
  organizer:z.string().trim().max(120).nullable().optional(),
  route:z.string().trim().max(500).nullable().optional(),
  meetingPoint:z.string().trim().max(300).nullable().optional(),
  quota:z.number().int().positive().max(100000).nullable().optional(),
  status:z.enum(["DRAFT","OPEN","FULL","CLOSED","CANCELLED","COMPLETED"]).optional()
});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;
  try{
    const body=schema.parse(await req.json());
    const event=await prisma.event.update({
      where:{id},
      data:{
        ...(body.name!==undefined?{name:body.name}:{}),
        ...(body.type!==undefined?{type:body.type}:{}),
        ...(body.game!==undefined?{game:body.game}:{}),
        ...(body.date!==undefined?{date:new Date(body.date)}:{}),
        ...(body.host!==undefined?{host:body.host}:{}),
        ...(body.organizer!==undefined?{organizer:body.organizer}:{}),
        ...(body.route!==undefined?{route:body.route}:{}),
        ...(body.meetingPoint!==undefined?{meetingPoint:body.meetingPoint}:{}),
        ...(body.quota!==undefined?{quota:body.quota}:{}),
        ...(body.status!==undefined?{status:body.status}:{})
      },
      select:{id:true,eventId:true,name:true,date:true,status:true}
    });
    return NextResponse.json({data:event});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid event data":"Event not found"},{status:error instanceof z.ZodError?400:404});
  }
}

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;
  try{
    await prisma.event.delete({where:{id}});
    return NextResponse.json({deleted:true,id});
  }catch{return NextResponse.json({error:"Event not found"},{status:404});}
}
