import {NextResponse} from "next/server";
import {getUpcomingEvents} from "@/lib/data";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({data:await getUpcomingEvents(),generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}