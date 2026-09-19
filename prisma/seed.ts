import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const url=process.env.DATABASE_URL;
if(!url) throw new Error("DATABASE_URL is required for db:seed");

const prisma=new PrismaClient({adapter:new PrismaPg({connectionString:url})});

const platforms=[
  ["BUSSID","Bus Simulator Indonesia","Bus Simulator"],
  ["ETS2","Euro Truck Simulator 2","Truck Simulator"],
  ["ATS","American Truck Simulator","Truck Simulator"],
  ["TOE3","Truckers of Europe 3","Truck Simulator"],
  ["TSI","Truck Simulator Indonesia","Truck Simulator"],
  ["ROBLOX","Roblox","Gaming Platform"],
] as const;

const achievements=[
  ["FIRST_CONVOY","FIRST CONVOY","Joined a community convoy."],
  ["EVENT_PARTICIPANT","EVENT PARTICIPANT","Participated in a community event."],
  ["ACTIVE_MEMBER","ACTIVE MEMBER","Maintained active community participation."],
  ["MOD_CREATOR","MOD CREATOR","Published an approved mod."],
  ["LIVERY_CREATOR","LIVERY CREATOR","Published a livery."],
  ["MEDIA_CREW","MEDIA CREW","Contributed community media."],
  ["COMMUNITY_CONTRIBUTOR","COMMUNITY CONTRIBUTOR","Made a meaningful community contribution."],
] as const;

try{
  for(const [id,name,type] of platforms) await prisma.platform.upsert({where:{id},update:{name,type,status:"ACTIVE"},create:{id,name,type,status:"ACTIVE"}});
  for(const [code,name,description] of achievements) await prisma.achievement.upsert({where:{code},update:{name,description},create:{code,name,description}});
}finally{await prisma.$disconnect()}
