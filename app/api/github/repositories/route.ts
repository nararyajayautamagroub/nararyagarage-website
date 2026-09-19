import {NextResponse} from "next/server";
import {listOwnedRepositories} from "@/lib/github";
export const dynamic="force-dynamic";
export async function GET(){
  try{return NextResponse.json({generatedAt:new Date().toISOString(),repositories:await listOwnedRepositories()},{headers:{"Cache-Control":"no-store"}})}
  catch(error){return NextResponse.json({generatedAt:new Date().toISOString(),repositories:[],error:error instanceof Error?error.message:"Live data unavailable"},{status:502,headers:{"Cache-Control":"no-store"}})}
}