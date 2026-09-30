import type { ReactNode } from "react";
import { mute } from "@/lib/styles";

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="mt-8 rounded-2xl border-2 border-dashed border-line bg-white p-8 text-center sm:p-12 dark:border-ink-650 dark:bg-ink-900">
      <h3 className="font-bold">{title}</h3>
      <p className={`mx-auto mt-1 max-w-sm text-sm ${mute}`}>{text}</p>
      {action}
    </div>
  );
}
