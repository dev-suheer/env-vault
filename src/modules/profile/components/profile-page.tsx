"use client";

import { RoleChip } from "@/components/brand/role-chip";
import { ROLE } from "@/lib/brand";
import { initOf } from "@/lib/format";
import { myWorkspaces } from "@/lib/permissions";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";

export function ProfilePage() {
  const { db, me } = useVault();
  if (!me) return null;

  const workspaces = myWorkspaces(me, db);
  const ownedEnvs = db.envs.filter((env) => env.owner === me.email);
  const personalEnvs = ownedEnvs.filter((env) => !env.ws);
  const stats =
    me.role === "admin"
      ? [
          { count: db.users.length, label: "Accounts" },
          { count: db.workspaces.length, label: "Workspaces" },
          { count: db.envs.filter((env) => env.ws).length, label: "Shared envs" },
        ]
      : me.role === "pm"
        ? [
            { count: workspaces.length, label: "Workspaces" },
            { count: ownedEnvs.length, label: "Envs you own" },
            { count: workspaces.reduce((count, workspace) => count + workspace.members.length, 0), label: "Devs in your workspaces" },
          ]
        : [
            { count: personalEnvs.length, label: "Personal envs" },
            { count: workspaces.length, label: "Workspaces" },
            { count: ownedEnvs.filter((env) => env.ws).length, label: "Shared envs you own" },
          ];

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className={`mt-1 text-sm ${mute}`}>Your account in this browser.</p>
      <div className={`${card} mt-6 p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
            {initOf(me.name)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{me.name}</h2>
            <p className={`mt-0.5 truncate text-sm ${mute}`}>{me.email}</p>
            <div className="mt-3">
              <RoleChip role={me.role} />
            </div>
          </div>
        </div>
        <p className={`mt-5 rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm ${mute} dark:border-ink-700 dark:bg-ink-950/60`}>
          {ROLE[me.role].note}
        </p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`${card} px-5 py-4`}>
            <p className="text-2xl font-extrabold">{stat.count}</p>
            <p className={`mt-1 text-sm ${mute}`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
