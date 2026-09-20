import {NextResponse} from "next/server";
import {getRepositoryDeepSnapshot,GITHUB_OWNER} from "@/lib/github";

export const dynamic="force-dynamic";

export async function GET(_req:Request,{params}:{params:Promise<{owner:string;name:string}>}){
  const {owner,name}=await params;
  if(owner.toLowerCase()!==GITHUB_OWNER.toLowerCase()){
    return NextResponse.json({error:"Repository owner is not connected"},{status:404});
  }
  const fullName=`${owner}/${name}`;
  try{
    const data=await getRepositoryDeepSnapshot(fullName);
    return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json(
      {error:error instanceof Error?error.message:"Repository unavailable"},
      {status:502,headers:{"Cache-Control":"no-store"}}
    );
  }
}