import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {listOwnedRepositories} from "@/lib/github";

export const dynamic="force-dynamic";

type Check="ok"|"unconfigured"|"error";

export async function GET(){
  const checks:{
    database:Check;
    github:Check;
    googleOAuth:Check;
    email:Check;
    authSecret:Check;
  }={
    database:"unconfigured",
    github:"error",
    googleOAuth:process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET?"ok":"unconfigured",
    email:process.env.EMAIL_API_URL&&process.env.EMAIL_API_KEY&&process.env.EMAIL_FROM?"ok":"unconfigured",
    authSecret:process.env.AUTH_SECRET?"ok":process.env.NODE_ENV==="production"?"error":"unconfigured"
  };

  const prisma=getPrisma();
  if(prisma){
    try{
      await prisma.$queryRaw`SELECT 1`;
      checks.database="ok";
    }catch{
      checks.database="error";
    }
  }

  try{
    await listOwnedRepositories();
    checks.github="ok";
  }catch{
    checks.github="error";
  }

  const healthy=
    checks.database!=="error" &&
    checks.github==="ok" &&
    checks.authSecret!=="error";

  return NextResponse.json(
    {status:healthy?"ok":"degraded",checks,generatedAt:new Date().toISOString()},
    {status:healthy?200:503,headers:{"Cache-Control":"no-store"}}
  );
}
