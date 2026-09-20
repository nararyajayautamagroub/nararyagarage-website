export const locales = [
  {code:"id",label:"Bahasa Indonesia"},
  {code:"en",label:"English"},
  {code:"ms",label:"Bahasa Melayu"},
  {code:"zh-CN",label:"简体中文"},
  {code:"ja",label:"日本語"},
  {code:"ko",label:"한국어"},
  {code:"ar",label:"العربية"},
  {code:"es",label:"Español"},
  {code:"fr",label:"Français"},
  {code:"de",label:"Deutsch"}
] as const;

export type Locale = typeof locales[number]["code"];
export const DEFAULT_LOCALE:Locale="id";
export const LOCALE_COOKIE="nararya_locale";

export function isLocale(value:string|undefined|null):value is Locale{
  return locales.some(locale=>locale.code===value);
}

const translations:Record<Locale,Record<string,string>>={
  id:{
    community:"Community",events:"Events",modding:"Modding",showcase:"Showcase",forum:"Forum",news:"News",repositories:"Repositories",
    login:"Login",join:"Join",submit:"Submit",member:"Member Center",language:"Bahasa"
  },
  en:{
    community:"Community",events:"Events",modding:"Modding",showcase:"Showcase",forum:"Forum",news:"News",repositories:"Repositories",
    login:"Login",join:"Join",submit:"Submit",member:"Member Center",language:"Language"
  },
  ms:{
    community:"Komuniti",events:"Acara",modding:"Modding",showcase:"Pameran",forum:"Forum",news:"Berita",repositories:"Repositori",
    login:"Log Masuk",join:"Sertai",submit:"Hantar",member:"Pusat Ahli",language:"Bahasa"
  },
  "zh-CN":{
    community:"社区",events:"活动",modding:"改模",showcase:"作品展示",forum:"论坛",news:"新闻",repositories:"仓库",
    login:"登录",join:"加入",submit:"提交",member:"会员中心",language:"语言"
  },
  ja:{
    community:"コミュニティ",events:"イベント",modding:"モッディング",showcase:"ショーケース",forum:"フォーラム",news:"ニュース",repositories:"リポジトリ",
    login:"ログイン",join:"参加",submit:"投稿",member:"メンバーセンター",language:"言語"
  },
  ko:{
    community:"커뮤니티",events:"이벤트",modding:"모딩",showcase:"쇼케이스",forum:"포럼",news:"뉴스",repositories:"리포지토리",
    login:"로그인",join:"가입",submit:"제출",member:"회원 센터",language:"언어"
  },
  ar:{
    community:"المجتمع",events:"الفعاليات",modding:"التعديل",showcase:"المعرض",forum:"المنتدى",news:"الأخبار",repositories:"المستودعات",
    login:"تسجيل الدخول",join:"انضم",submit:"إرسال",member:"مركز الأعضاء",language:"اللغة"
  },
  es:{
    community:"Comunidad",events:"Eventos",modding:"Modding",showcase:"Galería",forum:"Foro",news:"Noticias",repositories:"Repositorios",
    login:"Iniciar sesión",join:"Unirse",submit:"Enviar",member:"Centro de miembros",language:"Idioma"
  },
  fr:{
    community:"Communauté",events:"Événements",modding:"Modding",showcase:"Galerie",forum:"Forum",news:"Actualités",repositories:"Dépôts",
    login:"Connexion",join:"Rejoindre",submit:"Envoyer",member:"Espace membre",language:"Langue"
  },
  de:{
    community:"Community",events:"Events",modding:"Modding",showcase:"Showcase",forum:"Forum",news:"News",repositories:"Repositories",
    login:"Anmelden",join:"Beitreten",submit:"Absenden",member:"Mitgliederbereich",language:"Sprache"
  }
};

export function t(locale:Locale,key:string){
  return translations[locale][key]??translations[DEFAULT_LOCALE][key]??key;
}
