import {NextResponse} from "next/server";
import {z} from "zod";
import {getPrisma} from "@/lib/prisma";
import {requireRole} from "@/lib/authorization";
import {rejectCrossOrigin} from "@/lib/request-security";
import {logActivity} from "@/lib/activity";

const schema=z.object({
  status:z.enum(["ACTIVE","INACTIVE","ON_LEAVE","SUSPENDED","BANNED","RESIGNED"]).optional(),
  role:z.string().trim().min(2).max(60).optional(),
  userRole:z.enum(["MEMBER","STAFF","MODERATOR","ADMIN","OWNER"]).optional()
});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const originError=rejectCrossOrigin(req);
  if(originError)return originError;
  const auth=await requireRole(["OWNER","ADMIN"]);
  if(!auth.ok)return auth.response;
  const prisma=getPrisma();
  if(!prisma)return NextResponse.json({error:"Database unavailable"},{status:503});
  const {id}=await params;

  try{
    const body=schema.parse(await req.json());
    if(body.userRole==="OWNER"&&auth.session.user.role.toUpperCase()!=="OWNER"){
      return NextResponse.json({error:"Only OWNER can grant OWNER role"},{status:403});
    }

    const member=await prisma.member.findUnique({where:{id},select:{id:true,userId:true,memberId:true}});
    if(!member)return NextResponse.json({error:"Member not found"},{status:404});

    if(body.userRole==="OWNER"&&member.userId===auth.session.user.id){
      return NextResponse.json({error:"Cannot change your own ownership role through this endpoint"},{status:409});
    }

    const updated=await prisma.$transaction(async tx=>{
      const result=await tx.member.update({
        where:{id},
        data:{
          ...(body.status!==undefined?{status:body.status}:{}),
          ...(body.role!==undefined?{role:body.role}:{})
        },
        select:{id:true,memberId:true,status:true,role:true}
      });
      if(body.userRole!==undefined){
        await tx.user.update({where:{id:member.userId},data:{role:body.userRole}});
      }
      return result;
    });

    await logActivity({
      userId:auth.session.user.id,
      action:"ADMIN_MEMBER_UPDATE",
      entityType:"Member",
      entityId:member.id,
      metadata:{status:body.status??null,role:body.role??null,userRole:body.userRole??null}
    });

    return NextResponse.json({data:updated});
  }catch(error){
    return NextResponse.json({error:error instanceof z.ZodError?"Invalid member update":"Member update failed"},{status:400});
  }
}
