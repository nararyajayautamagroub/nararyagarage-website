import {createHmac,timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";

export const dynamic="force-dynamic";

function valid(raw:string,signature:string|null){
  const secret=process.env.GITHUB_WEBHOOK_SECRET;
  if(!secret||!signature||!signature.startsWith("sha256=")) return false;
  const expected=Buffer.from("sha256="+createHmac("sha256",secret).update(raw).digest("hex"));
  const received=Buffer.from(signature);
  return expected.length===received.length&&timingSafeEqual(expected,received);
}

export async function POST(req:Request){
  const raw=await req.text();
  if(!valid(raw,req.headers.get("x-hub-signature-256"))){
    return NextResponse.json({error:"Invalid signature"},{status:401});
  }
  let payload:Record<string,unknown>;
  try{payload=JSON.parse(raw) as Record<string,unknown>}
  catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
  const event=req.headers.get("x-github-event")||"unknown";
  const delivery=req.headers.get("x-github-delivery");
  const repository=(payload.repository as {full_name?:string}|undefined)?.full_name??null;
  return NextResponse.json({ok:true,event,delivery,repository,receivedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
}