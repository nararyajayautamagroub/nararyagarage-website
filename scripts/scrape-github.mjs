import "dotenv/config";
import {mkdir,rename,writeFile} from "node:fs/promises";
import {dirname,join} from "node:path";

const API="https://api.github.com";
const OWNER=process.env.GITHUB_OWNER||"nararyajayautamagroub";
const TOKEN=process.env.GITHUB_TOKEN||"";
const OUTPUT=process.env.GITHUB_SNAPSHOT_FILE||join(process.cwd(),"data","github-repositories.json");

const headers={
  Accept:"application/vnd.github+json",
  "X-GitHub-Api-Version":"2022-11-28",
  ...(TOKEN?{Authorization:`Bearer ${TOKEN}`}:{})
};

async function github(path){
  const response=await fetch(API+path,{headers});
  const body=await response.text();
  if(!response.ok)throw new Error(`GitHub API ${response.status}: ${body.slice(0,250)}`);
  return JSON.parse(body);
}

async function githubRaw(path){
  const response=await fetch(API+path,{headers:{...headers,Accept:"application/vnd.github.raw+json"}});
  if(response.status===404)return null;
  if(!response.ok)throw new Error(`GitHub raw API ${response.status}`);
  return response.text();
}

function decodeBase64(value){
  return Buffer.from(value.replace(/\n/g,""),"base64").toString("utf8");
}

async function listRepositories(){
  const repositories=[];
  for(let page=1;page<=10;page++){
    const path=TOKEN
      ? `/user/repos?visibility=all&affiliation=owner&per_page=100&page=${page}`
      : `/users/${encodeURIComponent(OWNER)}/repos?type=all&per_page=100&sort=updated&page=${page}`;
    const rows=await github(path);
    repositories.push(...rows);
    if(rows.length<100)break;
  }
  return repositories.filter((repo,index,array)=>array.findIndex(item=>item.full_name===repo.full_name)===index);
}

async function scrapeRepository(repo){
  const [languages,readme,packageData,release,commits,tree]=await Promise.all([
    github(`/repos/${repo.full_name}/languages`).catch(()=>({})),
    githubRaw(`/repos/${repo.full_name}/readme`).catch(()=>null),
    github(`/repos/${repo.full_name}/contents/package.json?ref=${encodeURIComponent(repo.default_branch)}`).catch(()=>null),
    github(`/repos/${repo.full_name}/releases/latest`).catch(()=>null),
    github(`/repos/${repo.full_name}/commits?per_page=5`).catch(()=>[]),
    github(`/repos/${repo.full_name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`).catch(()=>({tree:[],truncated:false}))
  ]);

  let packageJson=null;
  if(packageData?.content){
    try{
      const parsed=JSON.parse(decodeBase64(packageData.content));
      if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))packageJson=parsed;
    }catch{}
  }

  return {
    repository:{
      id:repo.id,
      full_name:repo.full_name,
      name:repo.name,
      private:repo.private,
      visibility:repo.visibility||null,
      html_url:repo.html_url,
      default_branch:repo.default_branch,
      description:repo.description,
      created_at:repo.created_at,
      updated_at:repo.updated_at,
      pushed_at:repo.pushed_at,
      stargazers_count:repo.stargazers_count,
      forks_count:repo.forks_count,
      open_issues_count:repo.open_issues_count,
      language:repo.language,
      size:repo.size,
      archived:repo.archived,
      disabled:repo.disabled,
      topics:repo.topics||[]
    },
    languages,
    readme:typeof readme==="string"?readme.slice(0,20000):null,
    packageJson,
    latestRelease:release?.tag_name?{
      tag_name:release.tag_name,
      name:release.name||release.tag_name,
      published_at:release.published_at||null,
      html_url:release.html_url
    }:null,
    commits:Array.isArray(commits)?commits.map(commit=>({
      sha:commit.sha,
      message:commit.commit?.message?.split("\n")[0]||"",
      author:commit.author?.login||commit.commit?.author?.name||"unknown",
      date:commit.commit?.author?.date||null,
      url:commit.html_url
    })):[],
    tree:Array.isArray(tree.tree)?tree.tree.slice(0,5000).map(item=>({
      path:item.path,
      type:item.type,
      size:item.size,
      sha:item.sha
    })):[],
    treeTruncated:Boolean(tree.truncated)||(Array.isArray(tree.tree)&&tree.tree.length>5000),
    scrapedAt:new Date().toISOString()
  };
}

async function mapLimit(items,limit,worker){
  const output=[];
  let cursor=0;
  async function run(){
    while(true){
      const index=cursor++;
      if(index>=items.length)return;
      try{output[index]=await worker(items[index]);}
      catch(error){
        output[index]={
          repository:items[index],
          error:error instanceof Error?error.message:"Unknown scraper error",
          scrapedAt:new Date().toISOString()
        };
      }
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,Math.max(items.length,1))},run));
  return output;
}

const repositories=await listRepositories();
const scraped=await mapLimit(repositories,4,scrapeRepository);
const output={
  source:"GitHub REST API",
  owner:OWNER,
  fetchedAt:new Date().toISOString(),
  repositoryCount:scraped.length,
  repositories:scraped
};

await mkdir(dirname(OUTPUT),{recursive:true});
const temp=OUTPUT+".tmp";
await writeFile(temp,JSON.stringify(output,null,2)+"\n","utf8");
await rename(temp,OUTPUT);
console.log(`Scraped ${scraped.length} repositories into ${OUTPUT}`);
