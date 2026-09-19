import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({data:[],configured:false,generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
  try{const data=await prisma.member.findMany({where:{status:"ACTIVE"},orderBy:{joinedAt:"desc"},take:100,select:{memberId:true,platformId:true,game:true,role:true,status:true,joinedAt:true,user:{select:{username:true,displayName:true,avatarUrl:true}}}});return NextResponse.json({data,configured:true,generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}
}