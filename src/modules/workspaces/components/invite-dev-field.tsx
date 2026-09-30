"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { initOf } from "@/lib/format";
import { input, mute } from "@/lib/styles";
import type { User } from "@/lib/types";

export function InviteDevField({
  devs,
  value,
  onChange,
}: {
  devs: User[];
  value: string;
  onChange: (email: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = devs.find((dev) => dev.email === value) ?? null;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return devs;
    return devs.filter((dev) => dev.name.toLowerCase().includes(needle) || dev.email.includes(needle));
  }, [devs, query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(email: string) {
    onChange(email);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`${input} flex items-center justify-between gap-3 text-left`}
        onClick={() => setOpen((current) => !current)}
      >
        {selected ? (
          <span className="min-w-0">
            <span className="block truncate font-medium">{selected.name}</span>
            <span className={`block truncate text-xs ${mute}`}>{selected.email}</span>
          </span>
        ) : (
          <span className={mute}>Choose a dev</span>
        )}
        <svg className={`h-4 w-4 shrink-0 text-[#8c959f] transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="fade surface absolute top-[calc(100%+0.35rem)] z-30 w-full min-w-56 overflow-hidden rounded-lg border border-line bg-white shadow-lg dark:border-ink-650 dark:bg-ink-900">
          <div className="border-b border-line p-2 dark:border-ink-700">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={input}
            />
          </div>
          <ul id={listId} role="listbox" aria-label="Devs you can invite" className="max-h-60 overflow-y-auto py-1">
            {matches.length ? (
              matches.map((dev) => {
                const chosen = dev.email === value;
                return (
                  <li key={dev.email}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={chosen}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${chosen ? "bg-brand-50 dark:bg-brand-500/15" : "hover:bg-[#eff2f5] dark:hover:bg-ink-800"}`}
                      onClick={() => choose(dev.email)}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                        {initOf(dev.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{dev.name}</span>
                        <span className={`block truncate text-xs ${mute}`}>{dev.email}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className={`px-3 py-6 text-center text-sm ${mute}`}>{devs.length ? "No devs match that search." : "Every dev is already invited or in this workspace."}</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
