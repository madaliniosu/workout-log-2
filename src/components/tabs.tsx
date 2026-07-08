"use client";

import { useState, type ReactNode } from "react";

type Tab = {
  label: string;
  content: ReactNode;
};

// Client-side, not URL-based: all tabs' content is already fetched in one
// Server Component pass (Activity loads exercises + workouts together
// regardless), so switching tabs shouldn't cost a full page round-trip for
// data that's already sitting in memory.
export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`-mb-px border-b-2 px-4 py-2 font-heading text-sm font-semibold ${
              i === activeIndex ? "border-accent text-text" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-6">{tabs[activeIndex].content}</div>
    </div>
  );
}
