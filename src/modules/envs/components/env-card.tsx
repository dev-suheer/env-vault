"use client";

import Link from "next/link";
import { LockIcon } from "@/components/brand/icons";
import { EnvChip } from "@/components/brand/env-chip";
import { ago, dispName, plural } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { EnvFile } from "@/lib/types";

export function EnvCard({ env, showOwner }: { env: EnvFile; showOwner: boolean }) {
  const { db, me } = useVault();
  if (!me) return null;
  const readOnly = !canEdit(me, env, db);
  return (
    <Link
      href={`/envs/${env.id}`}
      className="surface rounded-xl border border-line bg-white p-5 text-left transition-colors hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/70"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-bold">{env.name}</h3>
        <EnvChip env={env.env} />
      </div>
      <p className={`mt-1 line-clamp-2 min-h-10 text-sm ${mute}`}>{env.desc || "No description"}</p>
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8c959f] dark:text-ink-400">
        <span className="truncate">
          {plural(env.vars.length, "variable")} · Updated {ago(env.updated)}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {showOwner ? <span className="max-w-24 truncate sm:max-w-none">by {dispName(db.users, env.owner)}</span> : null}
          {readOnly ? (
            <span className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 dark:border-ink-700">
              <LockIcon className="h-3 w-3" strokeWidth={2} />
              View only
            </span>
          ) : null}
        </span>
      </div>
    </Link>
  );
}

export function EnvGrid({ list, showOwner, query }: { list: EnvFile[]; showOwner: boolean; query: string }) {
  const filtered = list.filter((env) => env.name.toLowerCase().includes(query.toLowerCase()));
  if (!filtered.length) return <p className={`text-sm ${mute}`}>No envs match your search.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((env) => (
        <EnvCard key={env.id} env={env} showOwner={showOwner} />
      ))}
    </div>
  );
}
