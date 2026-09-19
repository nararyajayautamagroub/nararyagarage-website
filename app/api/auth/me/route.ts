import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
export const dynamic="force-dynamic";
export async function GET(){const session=await getSession();if(!session)return NextResponse.json({user:null},{status:401});return NextResponse.json({user:{id:session.user.id,username:session.user.username,displayName:session.user.displayName,role:session.user.role,email:session.user.email}})}