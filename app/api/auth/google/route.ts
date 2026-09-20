import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createSignedState,OAUTH_STATE_COOKIE} from "@/lib/auth";

export const dynamic="force-dynamic";

export async function GET(req:Request){
  const clientId=process.env.GOOGLE_CLIENT_ID;
  const configuredRedirect=process.env.GOOGLE_REDIRECT_URI;
  if(!clientId){
    return NextResponse.json({error:"Google OAuth is not configured. Set GOOGLE_CLIENT_ID."},{status:503});
  }

  const url=new URL(req.url);
  const requestedNext=url.searchParams.get("next")||"/member";
  const state=createSignedState(requestedNext);
  const jar=await cookies();
  jar.set(OAUTH_STATE_COOKIE,state,{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    path:"/",
    maxAge:10*60
  });

  const redirectUri=configuredRedirect||new URL("/api/auth/google/callback",url.origin).toString();
  const google=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id",clientId);
  google.searchParams.set("redirect_uri",redirectUri);
  google.searchParams.set("response_type","code");
  google.searchParams.set("scope","openid email profile");
  google.searchParams.set("access_type","offline");
  google.searchParams.set("prompt","select_account");
  google.searchParams.set("state",state);

  return NextResponse.redirect(google);
}