export function isSameOrigin(req:Request){
  const origin=req.headers.get("origin");
  if(!origin)return true;

  const configured=process.env.NEXT_PUBLIC_SITE_URL;
  if(configured){
    try{return new URL(origin).origin===new URL(configured).origin;}catch{return false;}
  }

  const host=req.headers.get("x-forwarded-host")||req.headers.get("host");
  if(!host)return true;
  const proto=req.headers.get("x-forwarded-proto")||"https";
  return origin===`${proto}://${host}`;
}
