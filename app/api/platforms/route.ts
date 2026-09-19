import {NextResponse} from "next/server";
import {getPlatforms} from "@/lib/data";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({data:await getPlatforms(),generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}