import type { EnvKind, Role } from "@/lib/types";

export const ROLE: Record<Role, { label: string; tone: string; note: string }> = {
  admin: {
    label: "Admin",
    tone: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300",
    note: "Oversees every workspace and user.",
  },
  pm: {
    label: "Project Manager",
    tone: "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-emerald-300",
    note: "Creates workspaces and invites devs.",
  },
  dev: {
    label: "Dev",
    tone: "border-line bg-canvas text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400",
    note: "Personal envs, plus envs in joined workspaces.",
  },
};

export const ENVS: Record<EnvKind, { dot: string; tone: string }> = {
  Production: {
    dot: "bg-rose-500",
    tone: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25",
  },
  Staging: {
    dot: "bg-amber-500",
    tone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25",
  },
  Development: {
    dot: "bg-brand-500",
    tone: "bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-500/10 dark:text-emerald-300 dark:border-brand-500/25",
  },
};

export const MASK = "••••••••••••";
