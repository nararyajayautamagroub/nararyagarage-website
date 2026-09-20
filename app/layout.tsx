import type {Metadata,Viewport} from "next";
import {cookies} from "next/headers";
import "./globals.css";
import {Header} from "../components/header";
import {DEFAULT_LOCALE,isLocale,LOCALE_COOKIE} from "@/lib/i18n";

export const metadata: Metadata = {
  title:"NARARYA GARAGE | Virtual Simulator & Gaming Community",
  description:"Community hub for BUSSID, ETS2, ATS, TOE3, TSI, Roblox and other simulator communities.",
  applicationName:"NARARYA GARAGE",
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000")
};

export const viewport:Viewport={
  width:"device-width",
  initialScale:1,
  viewportFit:"cover",
  colorScheme:"dark",
  themeColor:"#f97316"
};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const jar=await cookies();
  const value=jar.get(LOCALE_COOKIE)?.value;
  const locale=isLocale(value)?value:DEFAULT_LOCALE;
  return <html lang={locale}><body className="min-h-screen overflow-x-hidden"><Header/>{children}<footer className="border-t border-white/10 px-4 py-10 text-sm text-zinc-500 sm:px-6"><div className="mx-auto max-w-7xl">© {new Date().getFullYear()} NARARYA GARAGE. Community first.</div></footer></body></html>;
}
