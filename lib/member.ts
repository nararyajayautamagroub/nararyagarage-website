import {getSession} from "@/lib/auth";
import {getPrisma} from "@/lib/prisma";

export async function getCurrentMember(){
  const session=await getSession();
  if(!session)return null;
  const prisma=getPrisma();
  if(!prisma)return {session,member:null,prisma:null as null};
  const member=await prisma.member.findUnique({
    where:{userId:session.user.id},
    select:{id:true,memberId:true,platformId:true,game:true,role:true,status:true,joinedAt:true,privacy:true}
  });
  return {session,member,prisma};
}
