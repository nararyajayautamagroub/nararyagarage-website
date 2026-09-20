import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {createAuthToken} from "@/lib/auth";
import {sendEmail,emailConfigured} from "@/lib/email";
import {getRequestIp,rateLimit} from "@/lib/rate-limit";
import {rejectCrossOrigin} from "@/lib/request-security";
import {z} from "zod";

const schema=z.object({email:z.string().email().max(254)});

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const limited=rateLimit("verify-request:"+getRequestIp(req),5,60*60_000);
  if(!limited.ok)return NextResponse.json({message:"Request diterima."},{status:202});

  try{
    const body=schema.parse(await req.json());
    const prisma=getPrisma();
    if(!prisma)return NextResponse.json({message:"Jika akun ada, instruksi akan dikirim."},{status:202});
    const user=await prisma.user.findUnique({where:{email:body.email.toLowerCase()}});
    if(!user||user.emailVerifiedAt||!emailConfigured()){
      return NextResponse.json({message:"Jika akun ada, instruksi verifikasi akan dikirim."},{status:202});
    }
    const token=await createAuthToken(user.id,"EMAIL_VERIFY",60);
    const base=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
    const link=base+"/verify-email?token="+encodeURIComponent(token);
    await sendEmail({
      to:user.email,
      subject:"Verifikasi akun NARARYA GARAGE",
      text:"Verifikasi akun kamu: "+link,
      html:"<p>Verifikasi akun NARARYA GARAGE.</p><p><a href=\"" + link + "\">Verifikasi email</a></p>"
    });
    return NextResponse.json({message:"Jika akun ada, instruksi verifikasi akan dikirim."},{status:202});
  }catch(error){
    return NextResponse.json({message:"Jika akun ada, instruksi verifikasi akan dikirim."},{status:202});
  }
}