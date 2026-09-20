import {NextResponse} from "next/server";
import {requireRole} from "@/lib/authorization";
import {getPrisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export async function GET(){
  const auth=await requireRole(["OWNER","ADMIN","STAFF","MODERATOR"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const data=await prisma.fleetVehicle.findMany({
    orderBy:{createdAt:"desc"},
    take:200,
    select:{id:true,name:true,category:true,platform:true,game:true,status:true,createdAt:true,member:{select:{memberId:true,user:{select:{username:true,displayName:true}}}}}
  });
  return NextResponse.json({data},{headers:{"Cache-Control":"no-store"}});
}