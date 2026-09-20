import {NextResponse} from "next/server";
import {requireRole} from "@/lib/authorization";
import {revalidatePath} from "next/cache";

export const dynamic="force-dynamic";

export async function POST(){
  const auth=await requireRole(["OWNER","ADMIN"]);
  if(!auth.ok)return auth.response;

  revalidatePath("/repositories");
  return NextResponse.json({
    ok:true,
    message:"Repository live data akan dibaca langsung dari GitHub pada request berikutnya.",
    refreshedAt:new Date().toISOString()
  });
}