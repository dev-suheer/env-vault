"use client";

import { MASK } from "@/lib/brand";
import { mute } from "@/lib/styles";

export function VariableRow({
  name,
  value,
  shown,
  edit,
  onToggle,
  onCopy,
  onRemove,
}: {
  name: string;
  value: string;
  shown: boolean;
  edit: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[#eaeef2] px-4 py-3 last:border-0 hover:bg-canvas sm:flex-row sm:items-center sm:gap-3 sm:px-5 dark:border-ink-700 dark:hover:bg-white/[0.03]">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-medium text-[#0550ae] dark:text-[#79c0ff]">{name}</p>
        <p className={`mt-0.5 truncate font-mono text-xs ${shown ? "text-[#0a3069] dark:text-[#a5d6ff]" : mute}`}>{shown ? value || "(empty)" : MASK}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button type="button" onClick={onToggle} className="py-1 text-xs font-semibold text-[#4b535d] hover:text-slate-900 dark:text-ink-200 dark:hover:text-white">
          {shown ? "Hide" : "Show"}
        </button>
        <button type="button" onClick={onCopy} className="py-1 text-xs font-semibold text-[#4b535d] hover:text-slate-900 dark:text-ink-200 dark:hover:text-white">
          Copy
        </button>
        {edit ? (
          <button type="button" onClick={onRemove} className="py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300">
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
