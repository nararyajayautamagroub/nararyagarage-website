import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {randomBytes} from "node:crypto";
import {getPrisma} from "@/lib/prisma";
import {createSession,hashPassword,verifySignedState,OAUTH_STATE_COOKIE} from "@/lib/auth";

type GoogleTokenResponse={access_token:string;id_token?:string};
type GoogleProfile={sub:string;email?:string;email_verified?:boolean;name?:string;picture?:string};

function usernameBase(email:string,name:string){
  const base=(name||email.split("@")[0]||"member").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,24)||"member";
  return base;
}

async function uniqueUsername(prisma:ReturnType<typeof getPrisma>,email:string,name:string){
  if(!prisma)throw new Error("Database unavailable");
  const base=usernameBase(email,name);
  let username=base;
  for(let index=0;index<100;index++){
    const exists=await prisma.user.findUnique({where:{username},select:{id:true}});
    if(!exists)return username;
    username=base+"_"+String(index+2);
  }
  return base+"_"+randomBytes(4).toString("hex");
}

export async function GET(req:Request){
  const url=new URL(req.url);
  const jar=await cookies();
  const state=jar.get(OAUTH_STATE_COOKIE)?.value||"";
  jar.delete(OAUTH_STATE_COOKIE);

  const parsedState=verifySignedState(state);
  if(!parsedState){
    return NextResponse.redirect(new URL("/login?error=oauth_state",url.origin));
  }

  const code=url.searchParams.get("code");
  const error=url.searchParams.get("error");
  if(error||!code){
    return NextResponse.redirect(new URL("/login?error=google_denied",url.origin));
  }

  const clientId=process.env.GOOGLE_CLIENT_ID;
  const clientSecret=process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri=process.env.GOOGLE_REDIRECT_URI||new URL("/api/auth/google/callback",url.origin).toString();
  if(!clientId||!clientSecret){
    return NextResponse.redirect(new URL("/login?error=google_not_configured",url.origin));
  }

  try{
    const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({
        code,
        client_id:clientId,
        client_secret:clientSecret,
        redirect_uri:redirectUri,
        grant_type:"authorization_code"
      })
    });
    if(!tokenResponse.ok)throw new Error("Google token exchange failed");
    const tokens=await tokenResponse.json() as GoogleTokenResponse;

    const profileResponse=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{
      headers:{Authorization:"Bearer "+tokens.access_token}
    });
    if(!profileResponse.ok)throw new Error("Google profile request failed");
    const profile=await profileResponse.json() as GoogleProfile;
    if(!profile.sub||!profile.email||profile.email_verified===false)throw new Error("Google account email is not verified");

    const email=profile.email.toLowerCase();
    const prisma=getPrisma();
    if(!prisma)throw new Error("Database unavailable");

    let identity=await prisma.authIdentity.findUnique({
      where:{provider_providerAccountId:{provider:"google",providerAccountId:profile.sub}},
      include:{user:true}
    });

    let user=identity?.user ?? undefined;
    if(!user){
      user= (await prisma.user.findUnique({where:{email}})) ?? undefined;
    }

    if(!user){
      const username=await uniqueUsername(prisma,email,profile.name||email.split("@")[0]);
      user=await prisma.user.create({
        data:{
          email,
          username,
          displayName:profile.name?.trim()||username,
          avatarUrl:profile.picture||null,
          passwordHash:hashPassword(randomBytes(48).toString("base64url")),
          emailVerifiedAt:profile.email_verified===false?null:new Date(),
          member:{create:{memberId:"NG-"+randomBytes(4).toString("hex").toUpperCase(),role:"Member"}}
        }
      });
    }else if(!user.emailVerifiedAt&&profile.email_verified!==false){
      user=await prisma.user.update({where:{id:user.id},data:{emailVerifiedAt:new Date()}});
    }

    await prisma.authIdentity.upsert({
      where:{provider_providerAccountId:{provider:"google",providerAccountId:profile.sub}},
      create:{provider:"google",providerAccountId:profile.sub,userId:user.id},
      update:{userId:user.id}
    });

    await createSession(user.id);
    return NextResponse.redirect(new URL(parsedState.next,url.origin));
  }catch(error){
    return NextResponse.redirect(new URL("/login?error=google_failed",url.origin));
  }
}