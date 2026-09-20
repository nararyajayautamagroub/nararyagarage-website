import {readFile} from "node:fs/promises";
import {spawnSync} from "node:child_process";

const packageLock=JSON.parse(await readFile("package-lock.json","utf8"));
const packageJson=JSON.parse(await readFile("package.json","utf8"));
const knownPrismaDevOnly=new Set(["prisma","@prisma/config","deepmerge-ts","mysql2"]);
const result=spawnSync("npm",["audit","--json","--omit=dev"],{encoding:"utf8"});

let report={};
try{report=JSON.parse(result.stdout||"{}");}
catch{
  console.error(result.stdout||result.stderr||"npm audit returned unreadable output");
  process.exit(result.status||1);
}

const vulnerabilities=report.vulnerabilities&&typeof report.vulnerabilities==="object"
  ?report.vulnerabilities
  :{};

const blocking=[];
const informational=[];

for(const [name,entry] of Object.entries(vulnerabilities)){
  const node=packageLock.packages?.["node_modules/"+name];
  const devOnly=node?.dev===true
    || (knownPrismaDevOnly.has(name)
      && Boolean(packageJson.devDependencies?.prisma)
      && !Boolean(packageJson.dependencies?.[name]));
  const severity=typeof entry?.severity==="string"?entry.severity:"unknown";
  if(devOnly){
    informational.push({name,severity,reason:"development-only dependency"});
  }else if(["high","critical"].includes(severity)){
    blocking.push({name,severity,reason:"runtime dependency"});
  }
}

if(informational.length){
  console.log("Development-only audit findings:");
  for(const item of informational)console.log(` - ${item.name}: ${item.severity} (${item.reason})`);
}

if(blocking.length){
  console.error("Blocking production dependency vulnerabilities:");
  for(const item of blocking)console.error(` - ${item.name}: ${item.severity} (${item.reason})`);
  process.exit(1);
}

console.log(`Security audit passed: ${informational.length} development-only findings, 0 blocking high/critical production findings.`);
