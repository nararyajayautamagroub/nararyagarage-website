const API="https://api.github.com";

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
      "X-GitHub-Api-Version":"2026-03-10",
      ...(token?{Authorization:`Bearer ${token}`}:{}),
    },
    cache:"no-store",
  });
  if(!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getRepo(fullName:string){return github<RepoSnapshot>(`/repos/${fullName}`)}

export async function listOwnedRepositories(){
  const all: RepoSnapshot[]=[];
  for(let page=1; page<=10; page++){
    const rows=await github<RepoSnapshot[]>(`/user/repos?visibility=all&affiliation=owner&per_page=100&page=${page}`);
    all.push(...rows);
    if(rows.length<100) break;
  }
  return all;
}

export async function getRepoCommits(fullName:string, limit=10){
  const rows=await github<any[]>(`/repos/${fullName}/commits?per_page=${Math.min(Math.max(limit,1),50)}`);
  return rows.map(c=>({
    sha:c.sha,
    message:c.commit?.message?.split("\n")[0]||"",
    author:c.author?.login||c.commit?.author?.name||"unknown",
    date:c.commit?.author?.date||null,
    url:c.html_url,
  }));
}