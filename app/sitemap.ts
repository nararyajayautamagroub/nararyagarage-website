import type {MetadataRoute} from "next";

const routes=[
  "/",
  "/community",
  "/platforms",
  "/events",
  "/convoy",
  "/modding",
  "/mods",
  "/liveries",
  "/showcase",
  "/gallery",
  "/videos",
  "/forum",
  "/tutorials",
  "/downloads",
  "/news",
  "/partners",
  "/achievements",
  "/fleet",
  "/recruitment",
  "/about",
  "/rules",
  "/contact",
  "/repositories"
];

export default function sitemap():MetadataRoute.Sitemap{
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  const now=new Date();
  return routes.map(path=>({url:base+path,lastModified:now,changeFrequency:"hourly",priority:path==="/" ? 1 : 0.7}));
}