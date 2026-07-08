"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Dumbbell, BarChart3, Menu, X } from "lucide-react";

const links = [
  { href: "/log", label: "Log", icon: Calendar, activeWhen: (path: string) => path.startsWith("/log") },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, activeWhen: (path: string) => path.startsWith("/workouts") },
  { href: "/analyze", label: "Analyze", icon: BarChart3, activeWhen: (path: string) => path.startsWith("/analyze") },
];

export function SideNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Shared by the desktop sidebar and the mobile drawer — one source of
  // truth for links and active styling. Closing on click is a no-op on
  // desktop (nothing is open) and dismisses the drawer on mobile.
  const navLinks = (
    <div className="flex w-full flex-col gap-2">
      {links.map((link) => {
        const isActive = link.activeWhen(pathname);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
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
  );

  return (
    <>
      {/* Desktop: permanent sidebar */}
      <nav className="hidden h-full w-[260px] shrink-0 flex-col gap-10 bg-white p-8 md:flex">
        <span className="font-heading text-2xl font-extrabold text-foreground">Workout Log</span>
        {navLinks}
      </nav>

      {/* Mobile: top bar with burger */}
      <header className="flex items-center justify-between bg-white px-4 py-3 md:hidden">
        <span className="font-heading text-xl font-extrabold text-foreground">Workout Log</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="text-foreground">
          <Menu size={24} strokeWidth={2} />
        </button>
      </header>

      {/* Mobile: slide-over drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <nav
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-72 flex-col gap-8 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl font-extrabold text-foreground">Workout Log</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="text-muted hover:text-foreground">
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            {navLinks}
          </nav>
        </div>
      )}
    </>
  );
}
