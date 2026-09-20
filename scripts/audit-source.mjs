import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";

const roots=["app","components","lib","scripts"];
const extensions=new Set([".ts",".tsx",".mjs",".prisma"]);
const banned=[
  [/TODO|FIXME/,"TODO/FIXME marker"],
  [/as\s+any\b/,"as any"],
  [/@ts-ignore|@ts-expect-error/,"TypeScript suppression"],
  [/<img\b/,"raw img tag"]
];

async function walk(directory){
  const entries=await readdir(directory,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=join(directory,entry.name);
    if(entry.isDirectory()){
      if(!["node_modules",".next","generated"].includes(entry.name))files.push(...await walk(full));
    }else{
      const ext=entry.name.slice(entry.name.lastIndexOf("."));
      if(extensions.has(ext))files.push(full);
    }
  }
  return files;
}

const files=(await Promise.all(roots.map(root=>walk(root)))).flat();
const issues=[];

for(const file of files){
  const content=await readFile(file,"utf8");
  for(const [pattern,label] of banned){
    if(pattern.test(content))issues.push(`${file}: ${label}`);
  }
}

if(issues.length){
  console.error("Source audit failed:");
  for(const issue of issues)console.error(" - "+issue);
  process.exit(1);
}

console.log(`Source audit passed for ${files.length} source files.`);
