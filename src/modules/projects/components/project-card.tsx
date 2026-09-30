"use client";

import Link from "next/link";
import { ago, plural } from "@/lib/format";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const { db } = useVault();
  const envs = db.envs.filter((env) => env.project === project.id).length;
  return (
    <Link
      href={`/workspaces/${project.ws}/projects/${project.id}`}
      className="surface rounded-xl border border-line bg-white p-5 text-left transition-colors hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/70"
    >
      <h3 className="truncate font-bold">{project.name}</h3>
      <p className={`mt-1 line-clamp-2 min-h-10 text-sm ${mute}`}>{project.desc || "No description"}</p>
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8c959f] dark:text-ink-400">
        <span className="truncate">{plural(envs, "env")}</span>
        <span className="shrink-0">{ago(project.created)}</span>
      </div>
    </Link>
  );
}
