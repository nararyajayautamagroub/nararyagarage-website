import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
import {listOwnedRepositories} from "@/lib/github";
export const dynamic="force-dynamic";
export async function GET(){
  const checks:{database:"ok"|"unconfigured"|"error";github:"ok"|"error"}={database:"unconfigured",github:"error"};
  const prisma=getPrisma();
  if(prisma){try{await prisma.$queryRaw`SELECT 1`;checks.database="ok"}catch{checks.database="error"}}
  try{await listOwnedRepositories();checks.github="ok"}catch{}
  const healthy=checks.database!=="error"&&checks.github==="ok";
  return NextResponse.json({status:healthy?"ok":"degraded",checks,generatedAt:new Date().toISOString()},{status:healthy?200:503,headers:{"Cache-Control":"no-store"}});
}