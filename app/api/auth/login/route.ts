import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {createSession,verifyPassword} from "@/lib/auth";
const schema=z.object({identifier:z.string().min(3).max(254),password:z.string().min(1).max(128)});
export async function POST(req:Request){
 try{
  const body=schema.parse(await req.json()); const prisma=getPrisma(); if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const user=await prisma.user.findFirst({where:{OR:[{email:body.identifier.toLowerCase()},{username:body.identifier}]}});
  if(!user||!verifyPassword(body.password,user.passwordHash))return NextResponse.json({error:"Invalid credentials"},{status:401});
  await createSession(user.id);
  return NextResponse.json({user:{id:user.id,username:user.username,displayName:user.displayName,role:user.role}});
 }catch{return NextResponse.json({error:"Login failed"},{status:400})}
}