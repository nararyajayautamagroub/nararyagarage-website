import {createHash,createHmac,randomBytes,scryptSync,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";
import {getPrisma} from "@/lib/prisma";

export const SESSION_COOKIE="nararya_session";
export const OAUTH_STATE_COOKIE="nararya_oauth_state";

export function hashPassword(password:string){
  const salt=randomBytes(16);
  const hash=scryptSync(password,salt,64);
  return salt.toString("hex")+":"+hash.toString("hex");
}

export function verifyPassword(password:string,stored:string){
  const [saltHex,hashHex]=stored.split(":");
  if(!saltHex||!hashHex)return false;
  const expected=Buffer.from(hashHex,"hex");
  const actual=scryptSync(password,Buffer.from(saltHex,"hex"),expected.length);
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}

function sha256(value:string){
  return createHash("sha256").update(value).digest("hex");
}

function authSecret(){
  const secret=process.env.AUTH_SECRET;
  if(secret)return secret;
  if(process.env.NODE_ENV==="production")throw new Error("AUTH_SECRET is required in production");
  return "development-only-change-me";
}

function sign(value:string){
  return createHmac("sha256",authSecret()).update(value).digest("base64url");
}

export function createSignedState(next:string){
  const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/member";
  const payload=[randomBytes(18).toString("base64url"),String(Date.now()),safeNext].join(".");
  return payload+"."+sign(payload);
}

export function verifySignedState(value:string){
  const parts=value.split(".");
  if(parts.length!==4)return null;
  const [nonce,created,next,signature]=parts;
  const payload=[nonce,created,next].join(".");
  const expected=sign(payload);
  const received=Buffer.from(signature);
  const expectedBuffer=Buffer.from(expected);
  if(received.length!==expectedBuffer.length||!timingSafeEqual(received,expectedBuffer))return null;
  const timestamp=Number(created);
  if(!Number.isFinite(timestamp)||Date.now()-timestamp>10*60*1000)return null;
  return {next:next.startsWith("/")&&!next.startsWith("//")?next:"/member"};
}

export async function createSession(userId:string){
  const prisma=getPrisma();
  if(!prisma)throw new Error("Database is not configured");
  await prisma.session.deleteMany({where:{userId,expiresAt:{lte:new Date()}}});
  const token=randomBytes(32).toString("base64url");
  await prisma.session.create({
    data:{
      userId,
      tokenHash:sha256(token),
      expiresAt:new Date(Date.now()+1000*60*60*24*30)
    }
  });
  const jar=await cookies();
  jar.set(SESSION_COOKIE,token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    path:"/",
    maxAge:60*60*24*30
  });
}

export async function getSession(){
  const prisma=getPrisma();
  if(!prisma)return null;
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token)return null;
  const session=await prisma.session.findUnique({
    where:{tokenHash:sha256(token)},
    include:{user:true}
  });
  if(!session||session.expiresAt<=new Date()){
    if(session)await prisma.session.delete({where:{id:session.id}});
    return null;
  }
  return session;
}

export async function destroySession(){
  const prisma=getPrisma();
  const jar=await cookies();
  const token=jar.get(SESSION_COOKIE)?.value;
  if(prisma&&token)await prisma.session.deleteMany({where:{tokenHash:sha256(token)}});
  jar.delete(SESSION_COOKIE);
}

export async function createAuthToken(userId:string,kind:string,minutes:number){
  const prisma=getPrisma();
  if(!prisma)throw new Error("Database is not configured");
  const raw=randomBytes(32).toString("base64url");
  await prisma.authToken.deleteMany({where:{userId,kind}});
  await prisma.authToken.create({
    data:{
      userId,
      kind,
      tokenHash:sha256(raw),
      expiresAt:new Date(Date.now()+minutes*60*1000)
    }
  });
  return raw;
}

export async function consumeAuthToken(raw:string,kind:string){
  const prisma=getPrisma();
  if(!prisma)return null;
  const record=await prisma.authToken.findFirst({
    where:{tokenHash:sha256(raw),kind,consumedAt:null,expiresAt:{gt:new Date()}},
    include:{user:true}
  });
  if(!record)return null;
  await prisma.authToken.update({where:{id:record.id},data:{consumedAt:new Date()}});
  return record;
}
