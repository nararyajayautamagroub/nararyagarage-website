import {rejectCrossOrigin} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {randomBytes} from "node:crypto";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {createSession,hashPassword} from "@/lib/auth";
import {getRequestIp,rateLimit} from "@/lib/rate-limit";
import {createAuthToken} from "@/lib/auth";
import {emailConfigured,sendEmail} from "@/lib/email";

const schema=z.object({
  email:z.string().email().max(254),
  username:z.string().regex(/^[a-zA-Z0-9_]{3,32}$/),
  displayName:z.string().trim().min(2).max(80),
  password:z.string().min(8).max(128)
});

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req); if(originError)return originError;
  const limited=rateLimit(`register:${getRequestIp(req)}`,4,60*60_000);
  if(!limited.ok)return NextResponse.json({error:"Terlalu banyak pendaftaran dari jaringan ini",retryAfter:limited.retryAfter},{status:429,headers:{"Retry-After":String(limited.retryAfter)}});

  try{
    const body=schema.parse(await req.json());
    const prisma=getPrisma();
    if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
    const exists=await prisma.user.findFirst({where:{OR:[{email:body.email.toLowerCase()},{username:body.username}]}});
    if(exists)return NextResponse.json({error:"Email or username already exists"},{status:409});

    const user=await prisma.user.create({
      data:{
        email:body.email.toLowerCase(),
        username:body.username,
        displayName:body.displayName,
        passwordHash:hashPassword(body.password),
        member:{create:{memberId:`NG-${randomBytes(4).toString("hex").toUpperCase()}`,role:"Member"}}
      },
      select:{id:true,username:true,displayName:true}
    });
    await createSession(user.id);

    let verificationSent=false;
    if(emailConfigured()){
      try{
        const token=await createAuthToken(user.id,"EMAIL_VERIFY",60);
        const base=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
        const link=base+"/verify-email?token="+encodeURIComponent(token);
        await sendEmail({
          to:body.email.toLowerCase(),
          subject:"Verifikasi akun NARARYA GARAGE",
          text:"Verifikasi akun kamu: "+link,
          html:"<p>Verifikasi akun NARARYA GARAGE.</p><p><a href=\"" + link + "\">Verifikasi email</a></p>"
        });
        verificationSent=true;
      }catch{}
    }

    return NextResponse.json({user,verificationSent},{status:201});
  }catch(error){
    if(error instanceof z.ZodError)return NextResponse.json({error:"Invalid registration data",issues:error.issues},{status:400});
    return NextResponse.json({error:"Registration failed"},{status:500});
  }
}