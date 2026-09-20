import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {getSession} from "@/lib/auth";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({body:z.string().trim().min(2).max(10000)});

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  const {id}=await params;
  try{
    const data=await prisma.forumPost.findMany({
      where:{threadId:id},
      orderBy:{createdAt:"asc"},
      take:200,
      select:{id:true,threadId:true,body:true,createdAt:true}
    });
    return NextResponse.json({data});
  }catch{return NextResponse.json({error:"Thread not found"},{status:404});}
}

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;

  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;
  try{
    const body=schema.parse(await req.json());
    const thread=await prisma.forumThread.findUnique({where:{id},select:{id:true,locked:true}});
    if(!thread)return NextResponse.json({error:"Thread not found"},{status:404});
    if(thread.locked)return NextResponse.json({error:"Thread is locked"},{status:409});
    const post=await prisma.forumPost.create({
      data:{threadId:id,authorId:session.user.id,body:body.body},
      select:{id:true,createdAt:true}
    });
    return NextResponse.json({data:post},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid post":"Failed to create reply"},{status:400});
  }
}