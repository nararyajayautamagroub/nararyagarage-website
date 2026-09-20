import {getPrisma} from "@/lib/prisma";

export async function logActivity(input:{
  userId:string;
  action:string;
  entityType?:string;
  entityId?:string;
  metadata?:unknown;
}){
  const prisma=getPrisma();
  if(!prisma)return;
  try{
    const member=await prisma.member.findUnique({where:{userId:input.userId},select:{id:true}});
    await prisma.activityLog.create({
      data:{
        memberId:member?.id??null,
        action:input.action,
        entityType:input.entityType??null,
        entityId:input.entityId??null,
        metadata:input.metadata===undefined?undefined:JSON.parse(JSON.stringify(input.metadata))
      }
    });
  }catch{}
}
