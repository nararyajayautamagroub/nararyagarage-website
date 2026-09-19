const API="https://api.github.com";
const OWNER=process.env.GITHUB_OWNER ?? "nararyajayautamagroub";

export type RepoSnapshot={
  id:number; full_name:string; name:string; private:boolean; html_url:string;
  default_branch:string; description:string|null; updated_at:string; pushed_at:string;
  stargazers_count:number; forks_count:number; open_issues_count:number; language:string|null;
};

export async function github<T>(path:string):Promise<T>{
  const token=process.env.GITHUB_TOKEN;
  const res=await fetch(API+path,{
    headers:{
      "Accept":"application/vnd.github+json",
      "X-GitHub-Api-Version":"2022-11-28",
      ...(token?{Authorization:`Bearer ${token}`}:{}),
    },
    cache:"no-store",
  });
  if(!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getRepo(fullName:string){
  return github<RepoSnapshot>(`/repos/${fullName}`);
}

export async function listOwnedRepositories(){
  const all: RepoSnapshot[]=[];
  for(let page=1;page<=10;page++){
    const path=process.env.GITHUB_TOKEN
      ? `/user/repos?visibility=all&affiliation=owner&per_page=100&page=${page}`
      : `/users/${OWNER}/repos?type=all&per_page=100&sort=updated&page=${page}`;
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
    message:c.commit?.message?.split("\n")[0]||"",
    author:c.author?.login||c.commit?.author?.name||"unknown",
    date:c.commit?.author?.date||null,
    url:c.html_url,
  }));
}