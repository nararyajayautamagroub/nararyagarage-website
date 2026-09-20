import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {createAuthToken} from "@/lib/auth";
import {sendEmail,emailConfigured} from "@/lib/email";
import {getRequestIp,rateLimit} from "@/lib/rate-limit";
import {rejectCrossOrigin} from "@/lib/request-security";

const schema=z.object({email:z.string().email().max(254)});

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const limited=rateLimit("password-forgot:"+getRequestIp(req),5,60*60_000);
  if(!limited.ok)return NextResponse.json({message:"Jika akun ada, instruksi reset akan dikirim."},{status:202});
  try{
    const body=schema.parse(await req.json());
    const prisma=getPrisma();
    if(prisma&&emailConfigured()){
      const user=await prisma.user.findUnique({where:{email:body.email.toLowerCase()}});
      if(user){
        const token=await createAuthToken(user.id,"PASSWORD_RESET",30);
        const base=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
        const link=base+"/reset-password?token="+encodeURIComponent(token);
        await sendEmail({
          to:user.email,
          subject:"Reset password NARARYA GARAGE",
          text:"Reset password kamu: "+link,
          html:"<p>Reset password NARARYA GARAGE.</p><p><a href=\"" + link + "\">Reset password</a></p>"
        });
      }
    }
    return NextResponse.json({message:"Jika akun ada, instruksi reset akan dikirim."},{status:202});
  }catch{
    return NextResponse.json({message:"Jika akun ada, instruksi reset akan dikirim."},{status:202});
  }
}