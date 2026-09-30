"use client";

import Link from "next/link";
import { RoleChip } from "@/components/brand/role-chip";
import { dispName, plural } from "@/lib/format";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Workspace } from "@/lib/types";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const { db, me } = useVault();
  if (!me) return null;
  const mine = workspace.pm === me.email;
  const projects = db.projects.filter((project) => project.ws === workspace.id).length;
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="surface rounded-xl border border-line bg-white p-5 text-left transition-colors hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/70"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-bold">{workspace.name}</h3>
        {me.role === "admin" ? null : <RoleChip role={mine ? "pm" : "dev"} label={mine ? "Owner" : "Member"} />}
      </div>
      <p className={`mt-1 line-clamp-2 min-h-10 text-sm ${mute}`}>{workspace.desc || "No description"}</p>
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8c959f] dark:text-ink-400">
        <span className="truncate">PM: {dispName(db.users, workspace.pm)}</span>
        <span className="shrink-0">
          {plural(projects, "project")} · {plural(workspace.members.length, "dev")}
        </span>
      </div>
    </Link>
  );
}
