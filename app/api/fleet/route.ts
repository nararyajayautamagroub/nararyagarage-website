import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {getSession} from "@/lib/auth";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({
  name:z.string().trim().min(2).max(120),
  category:z.string().trim().min(2).max(40),
  platform:z.string().trim().max(80).nullable().optional(),
  game:z.string().trim().max(80).nullable().optional(),
  chassis:z.string().trim().max(120).nullable().optional(),
  body:z.string().trim().max(120).nullable().optional(),
  livery:z.string().trim().max(120).nullable().optional(),
  screenshotUrl:z.string().url().max(2000).nullable().optional(),
  description:z.string().trim().max(5000).nullable().optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  try{
    const data=await prisma.fleetVehicle.findMany({
      where:{status:"PUBLISHED"},
      orderBy:{createdAt:"desc"},
      take:200,
      select:{
        id:true,name:true,category:true,platform:true,game:true,chassis:true,body:true,livery:true,screenshotUrl:true,description:true,createdAt:true,
        member:{select:{memberId:true,user:{select:{username:true,displayName:true}}}}
      }
    });
    return NextResponse.json({data,configured:true},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}
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
    const data=await prisma.fleetVehicle.create({
      data:{
        memberId:member.id,name:body.name,category:body.category,platform:body.platform??null,game:body.game??null,
        chassis:body.chassis??null,body:body.body??null,livery:body.livery??null,screenshotUrl:body.screenshotUrl??null,description:body.description??null
      },
      select:{id:true,name:true,category:true,status:true,createdAt:true}
    });
    await logActivity({userId:session.user.id,action:"FLEET_SUBMISSION_CREATE",entityType:"FleetVehicle",entityId:data.id});
    return NextResponse.json({data},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid fleet data":"Fleet submission failed"},{status:400});
  }
}