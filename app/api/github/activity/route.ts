import {NextResponse} from "next/server";
import {getRepoCommits, listOwnedRepositories} from "@/lib/github";

export const dynamic="force-dynamic";

export async function GET(){
  try{
    const repositories=await listOwnedRepositories();
    const data=await Promise.all(repositories.map(async repository=>{
      try{return {fullName:repository.full_name,commits:await getRepoCommits(repository.full_name,5)}}
      catch(error){return {fullName:repository.full_name,commits:[],error:error instanceof Error?error.message:"Live data unavailable"}}
    }));
    return NextResponse.json({generatedAt:new Date().toISOString(),repositories:data},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json({generatedAt:new Date().toISOString(),repositories:[],error:error instanceof Error?error.message:"GitHub unavailable"},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}