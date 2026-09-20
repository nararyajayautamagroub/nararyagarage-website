import {NextResponse} from "next/server";
import {requireRole} from "@/lib/authorization";
import {getAllRepositorySnapshots} from "@/lib/github";
import {rejectCrossOrigin} from "@/lib/request-security";

export const dynamic="force-dynamic";
export const maxDuration=60;

export async function POST(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;

  const auth=await requireRole(["OWNER","ADMIN"]);
  if(!auth.ok)return auth.response;

  try{
    const repositories=await getAllRepositorySnapshots();
    return NextResponse.json({
      ok:true,
      generatedAt:new Date().toISOString(),
      repositoryCount:repositories.length,
      repositories
    },{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json(
      {ok:false,error:error instanceof Error?error.message:"Repository scrape failed"},
      {status:502,headers:{"Cache-Control":"no-store"}}
    );
  }
}
