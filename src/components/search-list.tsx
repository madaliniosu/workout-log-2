"use client";

import { useState, type MouseEvent, type ReactNode } from "react";

// The search box + filtered list shared by the "add to log" modals.
// onSelect receives the click event too, so a caller can close the
// surrounding <dialog> without this component knowing about modals.
export function SearchList<T>({
  items,
  label,
  placeholder,
  getName,
  renderItem,
  onSelect,
}: {
  items: T[];
  label: string;
  placeholder: string;
  getName: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  onSelect: (item: T, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? items
      : items.filter((item) => getName(item).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-1">
      <span className="font-heading text-xs font-semibold text-muted">{label}</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="h-11 w-full rounded-xl border border-border px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <ul className="mt-1 max-h-72 overflow-auto rounded-xl border border-border bg-white">
        {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
        {filtered.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={(e) => onSelect(item, e)}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
            >
              {renderItem ? renderItem(item) : getName(item)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
