import {NextResponse} from "next/server";
import {destroySession} from "@/lib/auth";
import {rejectCrossOrigin} from "@/lib/request-security";

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  await destroySession();
  return NextResponse.json({ok:true});
}
