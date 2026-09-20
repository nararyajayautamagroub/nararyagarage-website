import type {MetadataRoute} from "next";

export default function manifest():MetadataRoute.Manifest{
  return {
    name:"NARARYA GARAGE",
    short_name:"NARARYA GARAGE",
    description:"Virtual Simulator & Gaming Community",
    start_url:"/",
    display:"standalone",
    background_color:"#08090b",
    theme_color:"#f97316",
    orientation:"portrait-primary",
    categories:["games","social","community"]
  };
}