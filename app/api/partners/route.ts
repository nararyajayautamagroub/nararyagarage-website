import {NextResponse} from "next/server";
import {getPrisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){const prisma=getPrisma();if(!prisma)return NextResponse.json({data:[],configured:false});try{return NextResponse.json({data:await prisma.partner.findMany({orderBy:{name:"asc"}}),configured:true},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}}