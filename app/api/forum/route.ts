import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){
 const prisma=getPrisma(); if(!prisma)return NextResponse.json({data:[],configured:false});
 try{const data=await prisma.forumThread.findMany({orderBy:[{pinned:"desc"},{createdAt:"desc"}],take:100,include:{category:true,_count:{select:{posts:true}}}});return NextResponse.json({data,configured:true},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}
}