import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {getSession} from "@/lib/auth";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({
  name:z.string().trim().min(2).max(160),
  vehicle:z.string().trim().min(2).max(120),
  platform:z.string().trim().max(80).nullable().optional(),
  game:z.string().trim().max(80).nullable().optional(),
  screenshotUrl:z.string().url().max(2000).nullable().optional(),
  credits:z.string().trim().max(2000).nullable().optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  try{
    const data=await prisma.livery.findMany({orderBy:{createdAt:"desc"},take:100,select:{id:true,name:true,author:true,vehicle:true,platform:true,game:true,screenshotUrl:true,credits:true,createdAt:true}});
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
    const livery=await prisma.livery.create({
      data:{
        name:body.name,
        author:session.user.username,
        vehicle:body.vehicle,
        platform:body.platform??null,
        game:body.game??null,
        screenshotUrl:body.screenshotUrl??null,
        credits:body.credits??null
      },
      select:{id:true,name:true,author:true,createdAt:true}
    });
    return NextResponse.json({data:livery},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid livery submission":"Failed to submit livery"},{status:400});
  }
}