import { ENVS } from "@/lib/brand";
import type { EnvKind } from "@/lib/types";

export function EnvChip({ env }: { env: EnvKind | string }) {
  const meta = ENVS[env as EnvKind] ?? ENVS.Development;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${meta.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {env}
    </span>
  );
}
