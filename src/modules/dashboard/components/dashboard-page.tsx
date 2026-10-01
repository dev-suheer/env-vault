"use client";

import Link from "next/link";
import { ago } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { ActivityChart, DonutChart } from "@/modules/dashboard/components/charts";
import { buildDashboard } from "@/modules/dashboard/lib/stats";

export function DashboardPage() {
  const { db, me } = useVault();
  if (!me || me.role !== "admin") return null;
  const stats = buildDashboard(db);

  const numbers = [
    { label: "Workspaces", value: stats.workspaces, hint: "Shared spaces across the app" },
    { label: "Projects", value: stats.projects, hint: "Where env files live" },
    { label: "Env files", value: stats.sharedEnvs + stats.personalEnvs, hint: `${stats.sharedEnvs} shared, ${stats.personalEnvs} personal` },
    { label: "People", value: stats.users, hint: `${stats.pms} project managers, ${stats.devs} devs` },
    { label: "Pending invites", value: stats.pendingInvites, hint: stats.pendingInvites ? "Waiting on a dev to accept" : "No invites waiting" },
    { label: "Changes, 7 days", value: stats.weekActivity, hint: "Recorded in workspace audit logs" },
  ];

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <p className={`mt-1 max-w-2xl text-sm ${mute}`}>
        A snapshot of workspaces, access, and recent changes.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {numbers.map((item) => (
          <div key={item.label} className={`${card} p-4`}>
            <p className={`text-xs font-semibold ${mute}`}>{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{item.value}</p>
            <p className={`mt-1 text-xs ${mute}`}>{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={`${card} p-5`}>
          <h2 className="text-sm font-bold">Activity</h2>
          <p className={`mt-1 text-xs ${mute}`}>Audit events per day. Variable values are never included.</p>
          <div className="mt-5">
            <ActivityChart days={stats.days} />
          </div>
        </section>
        <section className={`${card} p-5`}>
          <h2 className="text-sm font-bold">Member access</h2>
          <p className={`mt-1 text-xs ${mute}`}>Edit can change every env in that workspace. View can change only env files they create. Counted once per workspace.</p>
          <div className="mt-5">
            <DonutChart slices={stats.access} center="Member access grants" />
          </div>
        </section>
      </div>

      <section className={`${card} mt-4 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Busiest workspaces</h2>
              <p className={`mt-1 text-xs ${mute}`}>Ranked by how many env files they hold.</p>
            </div>
            <Link href="/workspaces" className="shrink-0 text-xs font-semibold text-brand-700 dark:text-brand-500">
              All workspaces
            </Link>
          </div>
          {stats.ranked.length ? (
            <ul className="mt-4 space-y-4">
              {stats.ranked.map((workspace) => {
                const max = Math.max(1, ...stats.ranked.map((item) => item.envs));
                return (
                  <li key={workspace.id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/workspaces/${workspace.id}`} className="truncate font-semibold">
                        {workspace.name}
                      </Link>
                      <span className={`shrink-0 text-xs ${mute}`}>
                        {workspace.envs} envs · {workspace.projects} projects · {workspace.editors} edit
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eff2f5] dark:bg-ink-800">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(workspace.envs / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={`mt-4 text-sm ${mute}`}>No workspaces yet. A project manager creates the first one.</p>
          )}
      </section>

      <section className={`${card} mt-4 p-5`}>
        <h2 className="text-sm font-bold">Latest changes</h2>
        <p className={`mt-1 text-xs ${mute}`}>Newest audit entries across every workspace.</p>
        {stats.recent.length ? (
          <ul className="mt-4 divide-y divide-[#eaeef2] dark:divide-ink-700">
            {stats.recent.map((entry) => (
              <li key={entry.id}>
                <Link href={entry.href} className="flex flex-wrap items-start justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {entry.action} · {entry.subject}
                    </p>
                    <p className={`mt-0.5 text-xs ${mute}`}>
                      {entry.detail} By {entry.who}.
                    </p>
                  </div>
                  <time className={`shrink-0 text-xs ${mute}`}>{ago(entry.at)}</time>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-4 text-sm ${mute}`}>No changes recorded yet. The chart fills in as people edit workspaces.</p>
        )}
      </section>
    </div>
  );
}
