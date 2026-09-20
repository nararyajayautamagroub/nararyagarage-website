import {rejectCrossOrigin} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {createSession,verifyPassword} from "@/lib/auth";
import {getRequestIp,rateLimit} from "@/lib/rate-limit";

const schema=z.object({identifier:z.string().min(3).max(254),password:z.string().min(1).max(128)});

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req); if(originError)return originError;
  const limited=rateLimit(`login:${getRequestIp(req)}`,8,60_000);
  if(!limited.ok)return NextResponse.json({error:"Terlalu banyak percobaan login",retryAfter:limited.retryAfter},{status:429,headers:{"Retry-After":String(limited.retryAfter)}});

  try{
    const body=schema.parse(await req.json());
    const prisma=getPrisma();
    if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
    const user=await prisma.user.findFirst({where:{OR:[{email:body.identifier.toLowerCase()},{username:body.identifier}] }});
    if(!user||!verifyPassword(body.password,user.passwordHash))return NextResponse.json({error:"Invalid credentials"},{status:401});
    await createSession(user.id);
    return NextResponse.json({user:{id:user.id,username:user.username,displayName:user.displayName,role:user.role}});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid login data":"Login failed"},{status:400});
  }
}