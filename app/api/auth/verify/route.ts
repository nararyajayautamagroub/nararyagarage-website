import {NextResponse} from "next/server";
import {consumeAuthToken,createSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export async function GET(req:Request){
  const url=new URL(req.url);
  const token=url.searchParams.get("token");
  if(!token)return NextResponse.redirect(new URL("/login?error=verification_token",url.origin));
  const record=await consumeAuthToken(token,"EMAIL_VERIFY");
  if(!record)return NextResponse.redirect(new URL("/login?error=verification_expired",url.origin));
  const prisma=getPrisma();
  if(!prisma)return NextResponse.redirect(new URL("/login?error=database",url.origin));
  await prisma.user.update({where:{id:record.userId},data:{emailVerifiedAt:new Date()}});
  await createSession(record.userId);
  return NextResponse.redirect(new URL("/member?verified=1",url.origin));
}