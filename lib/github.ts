const API="https://api.github.com";
const OWNER=process.env.GITHUB_OWNER ?? "nararyajayautamagroub";
const API_VERSION="2022-11-28";

export type RepoSnapshot={
  id:number;
  full_name:string;
  name:string;
  owner:{login:string};
  private:boolean;
  html_url:string;
  default_branch:string;
  description:string|null;
  updated_at:string;
  pushed_at:string|null;
  created_at:string;
  stargazers_count:number;
  forks_count:number;
  open_issues_count:number;
  language:string|null;
  size:number;
  archived:boolean;
  disabled:boolean;
  visibility?:string;
  topics?:string[];
};

export type RepoCommit={
  sha:string;
  message:string;
  author:string;
  date:string|null;
  url:string;
};

export type RepoTreeItem={path:string;type:string;size?:number;sha?:string};
export type RepoSourceFile={path:string;size:number;content:string|null};

export type RepositoryDeepSnapshot={
  repository:RepoSnapshot;
  readme:string|null;
  packageJson:Record<string,unknown>|null;
  languages:Record<string,number>;
  latestRelease:{tag_name:string;name:string;published_at:string|null;html_url:string}|null;
  commits:RepoCommit[];
  tree:RepoTreeItem[];
  treeTruncated:boolean;
  sourceFiles:RepoSourceFile[];
  fetchedAt:string;
};

function headers(){
  const token=process.env.GITHUB_TOKEN;
  return {
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":API_VERSION,
    ...(token?{Authorization:`Bearer ${token}`}:{})
  };
}

export async function github<T>(path:string,init?:RequestInit):Promise<T>{
  const res=await fetch(API+path,{
    ...init,
    headers:{...headers(),...(init?.headers??{})},
    cache:"no-store"
  });
  if(!res.ok){
    const message=await res.text().catch(()=> "");
    throw new Error(`GitHub API ${res.status}: ${message.slice(0,300)}`);
  }
  return res.json() as Promise<T>;
}

async function githubText(path:string){
  const res=await fetch(API+path,{headers:{...headers(),"Accept":"application/vnd.github.raw+json"},cache:"no-store"});
  if(res.status===404)return null;
  if(!res.ok)throw new Error(`GitHub API ${res.status}`);
  return res.text();
}

function decodeBase64(value:string){
  return Buffer.from(value.replace(/\n/g,""),"base64").toString("utf8");
}

export async function getRepo(fullName:string){
  return github<RepoSnapshot>(`/repos/${fullName}`);
}

export async function listOwnedRepositories(){
  const all:RepoSnapshot[]=[];
  for(let page=1;page<=10;page++){
    const path=process.env.GITHUB_TOKEN
      ? `/user/repos?visibility=all&affiliation=owner&per_page=100&page=${page}`
      : `/users/${encodeURIComponent(OWNER)}/repos?type=all&per_page=100&sort=updated&page=${page}`;
    const rows=await github<RepoSnapshot[]>(path);
    all.push(...rows);
    if(rows.length<100)break;
  }
  return all.filter((repo,index,array)=>array.findIndex(item=>item.full_name===repo.full_name)===index);
}

export async function getRepoCommits(fullName:string,limit=10){
  const safeLimit=Math.min(Math.max(limit,1),50);
  const rows=await github<Array<{
    sha:string;
    html_url:string;
    author?:{login?:string}|null;
    commit?:{message?:string;author?:{name?:string;date?:string|null}|null};
  }>>(`/repos/${fullName}/commits?per_page=${safeLimit}`);
  return rows.map(c=>({
    sha:c.sha,
    message:c.commit?.message?.split("\n")[0]??"",
    author:c.author?.login??c.commit?.author?.name??"unknown",
    date:c.commit?.author?.date??null,
    url:c.html_url
  }));
}

export async function getRepoReadme(fullName:string){
  return githubText(`/repos/${fullName}/readme`);
}

export async function getRepoFile(fullName:string,path:string,branch?:string){
  const query=branch?`?ref=${encodeURIComponent(branch)}`:"";
  const data=await github<{type:string;content?:string;encoding?:string}>(`/repos/${fullName}/contents/${path.split("/").map(encodeURIComponent).join("/")}${query}`);
  if(data.type!=="file"||!data.content)return null;
  return decodeBase64(data.content);
}

export async function getRepoLanguages(fullName:string){
  return github<Record<string,number>>(`/repos/${fullName}/languages`);
}

export async function getRepoRelease(fullName:string){
  try{
    return await github<{tag_name:string;name:string;published_at:string|null;html_url:string}>(`/repos/${fullName}/releases/latest`);
  }catch(error){
    if(error instanceof Error&&error.message.includes("GitHub API 404"))return null;
    throw error;
  }
}

export async function getRepoTree(fullName:string,branch:string){
  const tree=await github<{tree:Array<{path:string;type:string;size?:number;sha?:string}>;truncated:boolean}>(`/repos/${fullName}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
  return {
    tree:tree.tree.slice(0,5000).map(item=>({path:item.path,type:item.type,size:item.size,sha:item.sha})),
    truncated:tree.truncated||tree.tree.length>5000
  };
}

async function mapLimit<T,R>(items:T[],limit:number,worker:(item:T)=>Promise<R>){
  const output:R[]=[];
  let cursor=0;
  async function run(){
    while(true){
      const index=cursor++;
      if(index>=items.length)return;
      output[index]=await worker(items[index]);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,Math.max(items.length,1))},()=>run()));
  return output;
}

export async function getRepoSourceFiles(fullName:string,branch:string,tree:RepoTreeItem[],limit=24){
  const candidates=tree
    .filter(item=>item.type==="blob"&&/\.(json|md|mdx|ya?ml|toml|csv|txt)$/i.test(item.path))
    .filter(item=>/(^|\/)(data|config|configs|content|docs|public|src|app|README|readme)(\/|\.|$)/i.test(item.path))
    .sort((a,b)=>(a.size??0)-(b.size??0))
    .slice(0,Math.min(Math.max(limit,1),50));

  return mapLimit(candidates,4,async item=>{
    try{
      const raw=await getRepoFile(fullName,item.path,branch);
      const text=raw===null?null:raw.slice(0,12000);
      return {path:item.path,size:item.size??text?.length??0,content:text};
    }catch{
      return {path:item.path,size:item.size??0,content:null};
    }
  });
}

export async function getRepositoryDeepSnapshot(fullName:string):Promise<RepositoryDeepSnapshot>{
  const repository=await getRepo(fullName);
  const [readme,packageText,languages,latestRelease,commits,treeInfo]=await Promise.all([
    getRepoReadme(fullName),
    getRepoFile(fullName,"package.json",repository.default_branch),
    getRepoLanguages(fullName),
    getRepoRelease(fullName),
    getRepoCommits(fullName,5),
    getRepoTree(fullName,repository.default_branch)
  ]);
  const sourceFiles=await getRepoSourceFiles(fullName,repository.default_branch,treeInfo.tree,24);

  let packageJson:Record<string,unknown>|null=null;
  if(packageText){
    try{
      const parsed=JSON.parse(packageText) as unknown;
      if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))packageJson=parsed as Record<string,unknown>;
    }catch{
      packageJson=null;
    }
  }

  return {
    repository,
    readme:readme?readme.slice(0,20000):null,
    packageJson,
    languages,
    latestRelease,
    commits,
    tree:treeInfo.tree,
    treeTruncated:treeInfo.truncated,
    sourceFiles,
    fetchedAt:new Date().toISOString()
  };
}

export async function getAllRepositorySnapshots(){
  const repositories=await listOwnedRepositories();
  return mapLimit(repositories,4,async repo=>{
    try{return await getRepositoryDeepSnapshot(repo.full_name);}
    catch(error){
      return {
        repository:repo,
        readme:null,
        packageJson:null,
        languages:{},
        latestRelease:null,
        commits:[],
        tree:[],
        treeTruncated:false,
        sourceFiles:[],
        fetchedAt:new Date().toISOString(),
        error:error instanceof Error?error.message:"Repository sync failed"
      };
    }
  });
}

export function repositorySlug(owner:string,name:string){
  return `${owner}/${name}`;
}
