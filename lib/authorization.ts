import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";

export const ADMIN_ROLES = ["OWNER","ADMIN","STAFF","MODERATOR"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function hasRole(role:string, allowed:readonly string[]){
  return allowed.includes(role.trim().toUpperCase());
}

export async function requireRole(allowed:readonly string[] = ADMIN_ROLES){
  const session=await getSession();
  if(!session){
    return {ok:false as const,response:NextResponse.json({error:"Authentication required"},{status:401})};
  }
  if(!hasRole(session.user.role,allowed)){
    return {ok:false as const,response:NextResponse.json({error:"Forbidden"},{status:403})};
  }
  return {ok:true as const,session};
}