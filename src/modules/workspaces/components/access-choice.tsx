import type { MemberAccess } from "@/lib/types";

const options = [
  { value: "view", label: "View" },
  { value: "edit", label: "Edit" },
] as const;

export function AccessChoice({
  value,
  onChange,
  label,
}: {
  value: MemberAccess;
  onChange: (value: MemberAccess) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-line p-0.5 dark:border-ink-650">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${selected ? "bg-brand-600 text-white" : "text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
