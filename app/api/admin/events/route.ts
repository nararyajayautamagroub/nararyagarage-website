import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";

const schema=z.object({
  eventId:z.string().trim().min(2).max(60),
  name:z.string().trim().min(3).max(160),
  type:z.string().trim().min(2).max(60),
  platformId:z.string().trim().min(1).nullable().optional(),
  game:z.string().trim().max(80).nullable().optional(),
  communityId:z.string().trim().min(1).nullable().optional(),
  date:z.string().datetime(),
  host:z.string().trim().max(120).nullable().optional(),
  organizer:z.string().trim().max(120).nullable().optional(),
  route:z.string().trim().max(500).nullable().optional(),
  meetingPoint:z.string().trim().max(300).nullable().optional(),
  quota:z.number().int().positive().max(100000).nullable().optional(),
  status:z.enum(["DRAFT","OPEN","FULL","CLOSED","CANCELLED","COMPLETED"]).default("DRAFT")
});

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const data=await prisma.event.findMany({orderBy:{date:"desc"},take:200,select:{id:true,eventId:true,name:true,type:true,date:true,status:true,quota:true,game:true,route:true}});
  return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
}

export async function POST(req:Request){
  const auth=await requireRole(["OWNER","ADMIN","STAFF"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=schema.parse(await req.json());
    const event=await prisma.event.create({
      data:{
        eventId:body.eventId,
        name:body.name,
        type:body.type,
        platformId:body.platformId??null,
        game:body.game??null,
        communityId:body.communityId??null,
        date:new Date(body.date),
        host:body.host??null,
        organizer:body.organizer??null,
        route:body.route??null,
        meetingPoint:body.meetingPoint??null,
        quota:body.quota??null,
        status:body.status
      },
      select:{id:true,eventId:true,name:true,date:true,status:true}
    });
    return NextResponse.json({data:event},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid event data":"Event ID may already exist"},{status:400});
  }
}