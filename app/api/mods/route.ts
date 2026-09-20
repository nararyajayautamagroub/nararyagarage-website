import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {getSession} from "@/lib/auth";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({
  name:z.string().trim().min(2).max(160),
  platform:z.string().trim().max(80).nullable().optional(),
  game:z.string().trim().max(80).nullable().optional(),
  version:z.string().trim().max(40).nullable().optional(),
  description:z.string().trim().max(5000).nullable().optional(),
  screenshotUrl:z.string().url().max(2000).nullable().optional(),
  credits:z.string().trim().max(2000).nullable().optional(),
  license:z.string().trim().max(500).nullable().optional(),
  downloadUrl:z.string().url().max(2000).nullable().optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  try{
    const data=await prisma.mod.findMany({
      where:{status:"PUBLISHED"},
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,name:true,author:true,platform:true,game:true,version:true,description:true,screenshotUrl:true,credits:true,license:true,downloadUrl:true,createdAt:true}
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
    const mod=await prisma.mod.create({
      data:{
        name:body.name,
        author:session.user.username,
        platform:body.platform??null,
        game:body.game??null,
        version:body.version??null,
        description:body.description??null,
        screenshotUrl:body.screenshotUrl??null,
        credits:body.credits??null,
        license:body.license??null,
        downloadUrl:body.downloadUrl??null,
        status:"PENDING"
      },
      select:{id:true,name:true,status:true,createdAt:true}
    });
    return NextResponse.json({data:mod},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid mod submission":"Failed to submit mod"},{status:400});
  }
}