import {NextResponse} from "next/server";
import {z} from "zod";
import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";
import {locales,LOCALE_COOKIE,isLocale} from "@/lib/i18n";
import {cookies} from "next/headers";

const schema=z.object({
  emailNotifications:z.boolean().optional(),
  discordNotifications:z.boolean().optional(),
  whatsappNotifications:z.boolean().optional(),
  profileVisibility:z.boolean().optional(),
  activityVisibility:z.boolean().optional(),
  language:z.enum(locales.map(item=>item.code) as [string,...string[]]).optional()
});

export const dynamic="force-dynamic";

export async function GET(){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{privacy:true}});
  if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
  const privacy=member.privacy&&typeof member.privacy==="object"&&!Array.isArray(member.privacy)?member.privacy:{};
  const response=NextResponse.json({data:privacy},{headers:{"Cache-Control":"no-store"}});
  const language=typeof privacy.language==="string"&&isLocale(privacy.language)?privacy.language:null;
  if(language){
    (await cookies()).set(LOCALE_COOKIE,language,{
      httpOnly:false,
      secure:process.env.NODE_ENV==="production",
      sameSite:"lax",
      path:"/",
      maxAge:60*60*24*365
    });
  }
  return response;
}

export async function PATCH(req:Request){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  try{
    const body=schema.parse(await req.json());
    const member=await prisma.member.findUnique({where:{userId:session.user.id},select:{id:true,privacy:true}});
    if(!member)return NextResponse.json({error:"Member profile not found"},{status:404});
    const current=member.privacy&&typeof member.privacy==="object"&&!Array.isArray(member.privacy)?member.privacy:{};
    const privacy={...current,...body};
    const updated=await prisma.member.update({where:{id:member.id},data:{privacy},select:{privacy:true}});
    await logActivity({userId:session.user.id,action:"MEMBER_SETTINGS_UPDATE",entityType:"Member",entityId:member.id});
    return NextResponse.json({data:updated.privacy});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid settings":"Settings update failed"},{status:400});
  }
}