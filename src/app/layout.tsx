import type { Metadata } from "next";
import { Geist, Geist_Mono, Rethink_Sans } from "next/font/google";
import "./globals.css";
import { SideNav } from "@/components/side-nav";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Log",
  description: "Track workouts and progress over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex flex-1">
          <SideNav />
          <main className="flex-1 bg-background border-l border-border p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
