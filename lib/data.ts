import { getPrisma } from "@/lib/prisma";

export const fallbackPlatforms = [
  { id: "BUSSID", name: "Bus Simulator Indonesia", type: "Bus Simulator" },
  { id: "ETS2", name: "Euro Truck Simulator 2", type: "Truck Simulator" },
  { id: "ATS", name: "American Truck Simulator", type: "Truck Simulator" },
  { id: "TOE3", name: "Truckers of Europe 3", type: "Truck Simulator" },
  { id: "TSI", name: "Truck Simulator Indonesia", type: "Truck Simulator" },
  { id: "ROBLOX", name: "Roblox", type: "Gaming Platform" },
];

export async function getPlatforms(){
  const prisma=getPrisma();
  if(!prisma)return fallbackPlatforms;
  try{
    const rows=await prisma.platform.findMany({
      where:{status:"ACTIVE"},
      orderBy:{name:"asc"}
    });
    return rows.length?rows:fallbackPlatforms;
  }catch{
    return fallbackPlatforms;
  }
}

export async function getPlatform(id:string){
  const fallback=fallbackPlatforms.find(p=>p.id.toLowerCase()===id.toLowerCase())??null;
  const prisma=getPrisma();
  if(!prisma)return fallback;

  try{
    const platform=await prisma.platform.findFirst({
      where:{id:{equals:id,mode:"insensitive"}},
      include:{
        communities:{include:{_count:{select:{members:true,events:true}}}},
        _count:{select:{events:true}}
      }
    });
    if(!platform)return fallback;

    return {
      ...platform,
      memberCount:platform.communities.reduce((sum,community)=>sum+community._count.members,0),
      eventCount:platform._count.events
    };
  }catch{
    return fallback;
  }
}

export async function getUpcomingEvents(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.event.findMany({
      where:{status:{in:["DRAFT","OPEN","FULL"]},date:{gte:new Date()}},
      orderBy:{date:"asc"},
      take:12,
      include:{platform:true}
    });
  }catch{
    return [];
  }
}
