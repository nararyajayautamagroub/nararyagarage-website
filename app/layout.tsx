import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/header";

export const metadata: Metadata = {
  title:"NARARYA GARAGE | Virtual Simulator & Gaming Community",
  description:"Community hub for BUSSID, ETS2, ATS, TOE3, TSI, Roblox and other simulator communities.",
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="id"><body><Header/>{children}<footer className="border-t border-white/10 px-6 py-10 text-sm text-zinc-500"><div className="mx-auto max-w-7xl">© {new Date().getFullYear()} NARARYA GARAGE. Community first.</div></footer></body></html>;
}