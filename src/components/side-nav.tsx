"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Dumbbell, BarChart3 } from "lucide-react";

const links = [
  { href: "/", label: "Log", icon: Calendar, activeWhen: (path: string) => path === "/" || path.startsWith("/log") },
  { href: "/plan", label: "Plan", icon: Dumbbell, activeWhen: (path: string) => path.startsWith("/plan") },
  { href: "/analyze", label: "Analyze", icon: BarChart3, activeWhen: (path: string) => path.startsWith("/analyze") },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-[260px] shrink-0 flex-col gap-10 bg-white p-8">
      <span className="font-heading text-2xl font-extrabold text-foreground">Workout Log</span>

      <div className="flex w-full flex-col gap-2">
        {links.map((link) => {
          const isActive = link.activeWhen(pathname);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 ${
                isActive ? "bg-accent" : "opacity-60 hover:bg-background"
              }`}
            >
              <Icon size={20} strokeWidth={2} className="text-foreground" />
              <span className="font-heading text-[15px] font-semibold text-foreground">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
