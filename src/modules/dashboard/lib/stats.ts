import { dispName } from "@/lib/format";
import type { DB, InviteNotification } from "@/lib/types";

export type DayPoint = { key: string; label: string; title: string; value: number };

export type Slice = { label: string; value: number; color: string };

export type RankedWorkspace = {
  id: string;
  name: string;
  projects: number;
  envs: number;
  members: number;
  editors: number;
};

export type RecentChange = {
  id: string;
  href: string;
  action: string;
  subject: string;
  detail: string;
  who: string;
  at: number;
};

export type DashboardStats = {
  workspaces: number;
  projects: number;
  sharedEnvs: number;
  personalEnvs: number;
  users: number;
  pms: number;
  devs: number;
  pendingInvites: number;
  weekActivity: number;
  editors: number;
  days: DayPoint[];
  access: Slice[];
  ranked: RankedWorkspace[];
  recent: RecentChange[];
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function lastDays(count: number, audits: DB["audits"]) {
  const today = startOfDay(new Date());
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (count - 1 - index));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const value = (audits ?? []).filter((entry) => entry.at >= day.getTime() && entry.at < next.getTime()).length;
    return {
      key: String(day.getTime()),
      label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      title: day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
      value,
    };
  });
}

export function buildDashboard(db: DB): DashboardStats {
  const shared = db.envs.filter((env) => env.ws);
  const personal = db.envs.filter((env) => !env.ws);
  const pms = db.users.filter((user) => user.role === "pm").length;
  const devs = db.users.filter((user) => user.role === "dev").length;
  const pending = db.notifs.filter((note): note is InviteNotification => note.kind === "invite" && note.status === "pending");
  const days = lastDays(7, db.audits ?? []);
  const editors = db.workspaces.reduce((count, workspace) => count + (workspace.editors?.length ?? 0), 0);
  const members = db.workspaces.reduce((count, workspace) => count + workspace.members.length, 0);

  const ranked = db.workspaces
    .map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      projects: db.projects.filter((project) => project.ws === workspace.id).length,
      envs: shared.filter((env) => env.ws === workspace.id).length,
      members: workspace.members.length,
      editors: workspace.editors?.length ?? 0,
    }))
    .sort((a, b) => b.envs - a.envs || b.projects - a.projects || a.name.localeCompare(b.name));

  const recent = [...(db.audits ?? [])]
    .sort((a, b) => b.at - a.at)
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      href: `/workspaces/${entry.ws}?tab=audit`,
      action: entry.action,
      subject: entry.subject,
      detail: entry.detail,
      who: dispName(db.users, entry.by),
      at: entry.at,
    }));

  return {
    workspaces: db.workspaces.length,
    projects: db.projects.length,
    sharedEnvs: shared.length,
    personalEnvs: personal.length,
    users: db.users.length,
    pms,
    devs,
    pendingInvites: pending.length,
    weekActivity: days.reduce((count, day) => count + day.value, 0),
    editors,
    days,
    access: [
      { label: "Edit", value: editors, color: "#0f9d75" },
      { label: "View", value: Math.max(0, members - editors), color: "#8b949e" },
    ],
    ranked: ranked.slice(0, 5),
    recent,
  };
}
