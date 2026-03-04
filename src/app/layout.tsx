import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderActions } from "@/components/HeaderActions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loyalty App",
  description: "Εφαρμογή επιβράβευσης πελατών για καταστήματα.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="w-full border-b border-white/5 bg-black/40 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/40">
                  <span className="text-lg font-semibold text-emerald-400">
                    LA
                  </span>
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">
                    Loyalty App
                  </span>
                  <span className="text-xs text-slate-400">
                    Έξυπνη επιβράβευση πελατών
                  </span>
                </div>
              </div>
              <HeaderActions />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
