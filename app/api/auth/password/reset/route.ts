import {NextResponse} from "next/server";
import {z} from "zod";
import {consumeAuthToken,hashPassword} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({token:z.string().min(20),password:z.string().min(8).max(128)});

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  try{
    const body=schema.parse(await req.json());
    const record=await consumeAuthToken(body.token,"PASSWORD_RESET");
    if(!record)return NextResponse.json({error:"Reset token invalid or expired"},{status:400});
    const prisma=getPrisma();
    if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
    await prisma.user.update({where:{id:record.userId},data:{passwordHash:hashPassword(body.password)}});
    await prisma.session.deleteMany({where:{userId:record.userId}});
    return NextResponse.json({ok:true});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid reset data":"Password reset failed"},{status:400});
  }
}