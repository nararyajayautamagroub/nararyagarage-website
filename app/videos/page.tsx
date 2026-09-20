import {getVideos} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function VideosPage(){
  const videos=await getVideos();
  return <main className="mx-auto max-w-7xl px-6 py-16">
    <h1 className="text-4xl font-black">VIDEO SHOWCASE</h1>
    <p className="mt-3 text-zinc-400">Convoy, gameplay, mod showcase, tutorial, dan dokumentasi event.</p>
    {videos.length?<div className="mt-10 grid gap-5 md:grid-cols-2">{videos.map(video=><article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div className="aspect-video bg-black">{video.embedUrl?<iframe className="h-full w-full" src={video.embedUrl} title={video.title} loading="lazy" allowFullScreen/>:<div className="grid h-full place-items-center text-zinc-600">Video URL belum diisi.</div>}</div>
      <div className="p-5"><p className="text-xs font-bold uppercase tracking-widest text-orange-400">{video.type}</p><h2 className="mt-2 text-xl font-bold">{video.title}</h2><p className="mt-2 text-xs text-zinc-500">{video.author||"Unknown author"}</p></div>
    </article>)}</div>:<p className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-500">Belum ada video yang dipublikasikan.</p>}
  </main>;
}