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


export async function getPublishedMods(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.mod.findMany({
      where:{status:"PUBLISHED"},
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,name:true,author:true,platform:true,game:true,version:true,description:true,screenshotUrl:true,credits:true,license:true,downloadUrl:true,createdAt:true}
    });
  }catch{return [];}
}

export async function getLiveries(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.livery.findMany({
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,name:true,author:true,vehicle:true,platform:true,game:true,screenshotUrl:true,credits:true,createdAt:true}
    });
  }catch{return [];}
}

export async function getShowcases(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.showcase.findMany({
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,type:true,title:true,author:true,description:true,previewUrl:true,credits:true,license:true,createdAt:true}
    });
  }catch{return [];}
}

export async function getGalleryItems(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.galleryItem.findMany({
      orderBy:{id:"desc"},
      take:100,
      select:{id:true,url:true,type:true,author:true,credits:true,album:{select:{id:true,name:true,type:true}}}
    });
  }catch{return [];}
}

export async function getVideos(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.video.findMany({
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,title:true,embedUrl:true,type:true,author:true,createdAt:true}
    });
  }catch{return [];}
}

export async function getForumCategories(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.forumCategory.findMany({
      orderBy:{name:"asc"},
      select:{id:true,name:true,_count:{select:{threads:true}}}
    });
  }catch{return [];}
}

export async function getTutorials(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.tutorial.findMany({
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,title:true,category:true,body:true,author:true,createdAt:true}
    });
  }catch{return [];}
}

export async function getDownloads(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.download.findMany({
      orderBy:{createdAt:"desc"},
      take:100,
      select:{id:true,name:true,version:true,changelog:true,author:true,license:true,fileSize:true,checksum:true,url:true,downloads:true,createdAt:true}
    });
  }catch{return [];}
}

export async function getPublishedNews(){
  const prisma=getPrisma();
  if(!prisma)return [];
  try{
    return await prisma.news.findMany({
      where:{publishedAt:{not:null}},
      orderBy:{publishedAt:"desc"},
      take:100,
      select:{id:true,title:true,type:true,body:true,publishedAt:true,createdAt:true}
    });
  }catch{return [];}
}
