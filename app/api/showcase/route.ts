import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {getSession} from "@/lib/auth";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({
  type:z.string().trim().min(2).max(60),
  title:z.string().trim().min(2).max(160),
  description:z.string().trim().max(5000).nullable().optional(),
  previewUrl:z.string().url().max(2000).nullable().optional(),
  credits:z.string().trim().max(2000).nullable().optional(),
  license:z.string().trim().max(500).nullable().optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  try{
    const data=await prisma.showcase.findMany({
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,type:true,title:true,author:true,description:true,previewUrl:true,credits:true,license:true,createdAt:true}
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
    const showcase=await prisma.showcase.create({
      data:{
        type:body.type,
        title:body.title,
        author:session.user.username,
        description:body.description??null,
        previewUrl:body.previewUrl??null,
        credits:body.credits??null,
        license:body.license??null
      },
      select:{id:true,title:true,author:true,createdAt:true}
    });
    return NextResponse.json({data:showcase},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid showcase submission":"Failed to submit showcase"},{status:400});
  }
}