  const originError=rejectCrossOrigin(req); if(originError)return originError;
import {rejectCrossOrigin} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {destroySession} from "@/lib/auth";
export async function POST(){await destroySession();return NextResponse.json({ok:true})}