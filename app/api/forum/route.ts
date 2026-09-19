import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {getSession} from "@/lib/auth";

const schema=z.object({
  categoryId:z.string().min(1),
  title:z.string().trim().min(4).max(160),
  body:z.string().trim().min(10).max(10000)
});

export const dynamic="force-dynamic";

export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false});
  try{
    const data=await prisma.forumThread.findMany({
      orderBy:[{pinned:"desc"},{createdAt:"desc"}],
      take:100,
      include:{category:true,_count:{select:{posts:true}}}
    });
    return NextResponse.json({data,configured:true},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}
}

export async function POST(req:Request){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=schema.parse(await req.json());
    const category=await prisma.forumCategory.findUnique({where:{id:body.categoryId},select:{id:true}});
    if(!category)return NextResponse.json({error:"Forum category not found"},{status:404});
    const thread=await prisma.forumThread.create({
      data:{categoryId:body.categoryId,authorId:session.user.id,title:body.title,body:body.body},
      select:{id:true,title:true,createdAt:true}
    });
    return NextResponse.json({data:thread},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid thread":"Failed to create thread"},{status:400});
  }
}