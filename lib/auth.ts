import {createHash,randomBytes,scryptSync,timingSafeEqual} from "node:crypto";
import {getPrisma} from "@/lib/prisma";
import {cookies} from "next/headers";

export const SESSION_COOKIE="nararya_session";

export function hashPassword(password:string){
  const salt=randomBytes(16);
  const hash=scryptSync(password,salt,64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}
export function verifyPassword(password:string,stored:string){
  const [saltHex,hashHex]=stored.split(":");
  if(!saltHex||!hashHex)return false;
  const expected=Buffer.from(hashHex,"hex");
  const actual=scryptSync(password,Buffer.from(saltHex,"hex"),expected.length);
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
function tokenHash(token:string){return createHash("sha256").update(token).digest("hex")}
export async function createSession(userId:string){
  const prisma=getPrisma(); if(!prisma) throw new Error("Database is not configured");
  const token=randomBytes(32).toString("base64url");
  await prisma.session.create({data:{userId,tokenHash:tokenHash(token),expiresAt:new Date(Date.now()+1000*60*60*24*30)}});
  const jar=await cookies();
  jar.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*30});
}
export async function getSession(){
  const prisma=getPrisma(); if(!prisma)return null;
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token)return null;
  const session=await prisma.session.findUnique({where:{tokenHash:tokenHash(token)},include:{user:true}});
  if(!session||session.expiresAt<=new Date()){if(session)await prisma.session.delete({where:{id:session.id}});return null}
  return session;
}
export async function destroySession(){
  const prisma=getPrisma();
  const jar=await cookies();
  const token=jar.get(SESSION_COOKIE)?.value;
  if(prisma&&token)await prisma.session.deleteMany({where:{tokenHash:tokenHash(token)}});
  jar.delete(SESSION_COOKIE);
}