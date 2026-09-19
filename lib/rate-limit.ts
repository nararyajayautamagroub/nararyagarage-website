type Bucket={count:number;resetAt:number};

const buckets=new Map<string,Bucket>();
const MAX_BUCKETS=10_000;

export function rateLimit(key:string,limit=10,windowMs=60_000){
  const now=Date.now();
  const current=buckets.get(key);

  if(buckets.size>MAX_BUCKETS){
    for(const [bucketKey,bucket] of buckets){
      if(bucket.resetAt<=now)buckets.delete(bucketKey);
      if(buckets.size<=MAX_BUCKETS)break;
    }
  }

  if(!current||current.resetAt<=now){
    buckets.set(key,{count:1,resetAt:now+windowMs});
    return {ok:true,retryAfter:0};
  }
  if(current.count>=limit){
    return {ok:false,retryAfter:Math.ceil((current.resetAt-now)/1000)};
  }
  current.count+=1;
  return {ok:true,retryAfter:0};
}

export function getRequestIp(req:Request){
  const forwarded=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded||req.headers.get("x-real-ip")||"unknown";
}