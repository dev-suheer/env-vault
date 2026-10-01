"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { input } from "@/lib/styles";

export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "mt-1",
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(options.indexOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: T) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActive(Math.max(0, options.indexOf(value)));
      setOpen(true);
    }
  }

  function onListKey(event: ReactKeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(options[active] ?? value);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        className={`${input} flex items-center justify-between gap-3 text-left`}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          setActive(Math.max(0, options.indexOf(value)));
          setOpen(true);
        }}
        onKeyDown={onTriggerKey}
      >
        <span>{value}</span>
        <svg className={`h-4 w-4 shrink-0 text-[#8c959f] transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onListKey}
          className="fade surface absolute top-[calc(100%+0.35rem)] z-20 w-full overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg outline-none dark:border-ink-650 dark:bg-ink-900"
        >
          {options.map((option, index) => {
            const selected = option === value;
            return (
              <li key={option} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${selected || index === active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-emerald-300" : "text-fg hover:bg-[#eff2f5] dark:text-ink-100 dark:hover:bg-ink-800"}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                >
                  <span className={`grid h-4 w-4 place-items-center ${selected ? "opacity-100" : "opacity-0"}`} aria-hidden>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.2 4.2L19 7.5" />
                    </svg>
                  </span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
