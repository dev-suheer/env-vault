import { ROLE } from "@/lib/brand";
import type { Role } from "@/lib/types";

export function RoleChip({ role, label }: { role: Role; label?: string }) {
  const meta = ROLE[role];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${meta.tone}`}>
      {label ?? meta.label}
    </span>
  );
}
