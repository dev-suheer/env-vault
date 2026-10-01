"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UserPhoto } from "@/components/brand/avatar";
import { Crumbs } from "@/components/brand/crumbs";
import { EnvChip } from "@/components/brand/env-chip";
import { PencilIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { SelectMenu } from "@/components/brand/select-menu";
import { ROLE } from "@/lib/brand";
import { ago, dispName, plural } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { LoginLineChart } from "@/modules/dashboard/components/charts";
import { busiestLogin, loginPoints, type LoginRange } from "@/modules/users/lib/logins";
import { EditUserModal } from "@/modules/users/components/edit-user-modal";

function readEmail(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function recorded(value: number | null, withTime: boolean) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(value);
}

export function UserDetailPage() {
  const params = useParams<{ email: string }>();
  const router = useRouter();
  const { db, me } = useVault();
  const [editing, setEditing] = useState(false);
  const [range, setRange] = useState<LoginRange>("Week");
  const email = readEmail(params.email).trim().toLowerCase();
  const user = db.users.find((item) => item.email === email);

  useEffect(() => {
    if (me?.role === "admin" && (!user || user.role === "admin")) router.replace("/users");
  }, [me, router, user]);

  if (!me || me.role !== "admin" || !user || user.role === "admin") return null;

  const active = user.active !== false;
  const owned = db.workspaces.filter((workspace) => workspace.pm === user.email);
  const joined = db.workspaces.filter((workspace) => workspace.members.includes(user.email) && workspace.pm !== user.email);
  const linked = [...owned, ...joined];
  const memberRows = linked.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    members: workspace.members.length + 1,
  }));
  const memberTotal = memberRows.reduce((count, row) => count + row.members, 0);
  const memberPeak = Math.max(1, ...memberRows.map((row) => row.members));
  const envs = db.envs.filter((env) => env.owner === user.email).sort((a, b) => b.updated - a.updated);
  const personal = envs.filter((env) => !env.ws);
  const shared = envs.filter((env) => env.ws);
  const audits = (db.audits ?? []).filter((entry) => entry.by === user.email).sort((a, b) => b.at - a.at);
  const days = loginPoints(user.logins, range);
  const busiest = busiestLogin(days);
  const signIns = days.reduce((count, day) => count + day.value, 0);
  const windowLabel = range === "Week" ? "7 days" : range === "Month" ? "30 days" : "12 months";

  const facts = [
    { label: "Signed up", value: recorded(user.created, false) },
    { label: "Last login", value: user.lastLogin ? `${recorded(user.lastLogin, true)} · ${ago(user.lastLogin)}` : "Not recorded" },
    { label: "Last login device", value: user.lastDevice || "Not recorded" },
    { label: "Phone", value: user.phone.trim() || "No phone number" },
  ];

  return (
    <div className="fade">
      <Crumbs items={[{ href: "/users", label: "Users" }, { label: user.name }]} />
      <section className={`${card} mt-4 p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <UserPhoto name={user.name} image={user.image} className="h-16 w-16 text-xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-extrabold">{user.name}</h1>
              <RoleChip role={user.role} />
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                  active
                    ? "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-emerald-300"
                    : "border-line bg-canvas text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className={`mt-1 truncate text-sm ${mute}`}>{user.email}</p>
            <p className={`mt-1 text-xs ${mute}`}>{ROLE[user.role].note}</p>
          </div>
          <button
            type="button"
            aria-label={`Edit ${user.name}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            onClick={() => setEditing(true)}
          >
            <PencilIcon />
          </button>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className={`${card} p-4`}>
            <p className={`text-xs font-semibold ${mute}`}>{fact.label}</p>
            <p className="mt-2 text-sm font-semibold">{fact.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={`${card} flex flex-col p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Linked workspaces</h2>
              <p className={`mt-1 text-xs ${mute}`}>Workspaces this account owns or has joined.</p>
            </div>
            <span className="rounded-md border border-line bg-canvas px-2 py-1 text-xs font-bold dark:border-ink-700 dark:bg-ink-950">{linked.length}</span>
          </div>
          {linked.length ? (
            <ul className="mt-4 space-y-2">
              {linked.map((workspace) => {
                const access = workspace.pm === user.email ? "Project manager" : workspace.editors?.includes(user.email) ? "Edit" : "View";
                const projectCount = db.projects.filter((project) => project.ws === workspace.id).length;
                const envCount = db.envs.filter((env) => env.ws === workspace.id).length;
                return (
                  <li key={workspace.id}>
                    <Link
                      href={`/workspaces/${workspace.id}`}
                      className="flex items-center gap-3 rounded-lg border border-line px-3 py-3 hover:border-brand-500 dark:border-ink-700 dark:hover:border-brand-500/70"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{workspace.name}</p>
                        <p className={`mt-0.5 truncate text-xs ${mute}`}>
                          {plural(projectCount, "project")} · {plural(envCount, "env")}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          access === "Edit"
                            ? "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-emerald-300"
                            : "border-line bg-canvas text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400"
                        }`}
                      >
                        {access}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={`mt-6 text-sm ${mute}`}>This account has not joined a workspace yet.</p>
          )}
        </section>

        <section className={`${card} flex flex-col p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Env files</h2>
              <p className={`mt-1 text-xs ${mute}`}>Files this account created.</p>
            </div>
            <span className="rounded-md border border-line bg-canvas px-2 py-1 text-xs font-bold dark:border-ink-700 dark:bg-ink-950">{envs.length}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-canvas px-3 py-3 dark:bg-ink-950">
              <p className={`text-xs font-semibold ${mute}`}>In projects</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">{shared.length}</p>
            </div>
            <div className="rounded-lg bg-canvas px-3 py-3 dark:bg-ink-950">
              <p className={`text-xs font-semibold ${mute}`}>Personal</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">{personal.length}</p>
            </div>
          </div>
          {envs.length ? (
            <ul className="mt-4 space-y-2">
              {envs.slice(0, 3).map((env) => {
                const workspace = db.workspaces.find((item) => item.id === env.ws);
                return (
                  <li key={env.id}>
                    <Link
                      href={`/envs/${env.id}`}
                      className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 hover:border-brand-500 dark:border-ink-700 dark:hover:border-brand-500/70"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{env.name}</p>
                        <p className={`mt-0.5 truncate text-xs ${mute}`}>{workspace ? workspace.name : "Personal"} · {plural(env.vars.length, "variable")}</p>
                      </div>
                      <EnvChip env={env.env} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={`mt-4 text-sm ${mute}`}>No env files yet.</p>
          )}
          {envs.length > 3 ? (
            <Link href={`/users/${encodeURIComponent(user.email)}/envs`} className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-500">
              View all
            </Link>
          ) : null}
        </section>
      </div>

      <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <section className={`${card} p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Login activity</h2>
              <p className={`mt-1 text-xs ${mute}`}>
                {plural(signIns, "sign-in")} in the last {windowLabel}.
                {busiest ? ` Most on ${busiest.title} (${plural(busiest.count, "sign-in")}).` : " No sign-ins recorded in this window yet."}
              </p>
            </div>
            <div className="w-36">
              <SelectMenu label="Login range" value={range} options={["Week", "Month", "Year"] as const} onChange={setRange} className="" />
            </div>
          </div>
          <div className="mt-3">
            <LoginLineChart days={days} />
          </div>
        </section>

        <section className={`${card} flex flex-col p-5`}>
          <h2 className="text-sm font-bold">Workspace members</h2>
          <p className={`mt-1 text-xs ${mute}`}>People in the workspaces this account owns or has joined.</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">{memberTotal}</p>
          <p className={`mt-1 text-xs ${mute}`}>{plural(linked.length, "workspace")}</p>
          {memberRows.length ? (
            <ul className="mt-4 space-y-3">
              {memberRows.map((row) => (
                <li key={row.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Link href={`/workspaces/${row.id}`} className="truncate font-semibold">
                      {row.name}
                    </Link>
                    <span className={`shrink-0 text-xs ${mute}`}>{plural(row.members, "member")}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas dark:bg-ink-950">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max((row.members / memberPeak) * 100, 8)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-6 text-sm ${mute}`}>No workspace members yet.</p>
          )}
        </section>
      </div>

      <section className={`${card} mt-4 overflow-hidden`}>
        <div className="border-b border-line px-5 py-4 dark:border-ink-700">
          <h2 className="text-sm font-bold">Audit log</h2>
          <p className={`mt-1 text-xs ${mute}`}>Every workspace change recorded for {dispName(db.users, user.email)}.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs font-semibold tracking-wide text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400">
                {["When", "Workspace", "Action", "What", "Change"].map((column) => (
                  <th key={column} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audits.length ? (
                audits.map((entry) => {
                  const when = new Date(entry.at);
                  const stamp = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(when);
                  const workspace = db.workspaces.find((item) => item.id === entry.ws);
                  return (
                    <tr key={entry.id} className="border-b border-[#eaeef2] align-top last:border-0 hover:bg-[#f6f8fa] dark:border-ink-700 dark:hover:bg-ink-800/50">
                      <td className="px-4 py-3 pl-5 whitespace-nowrap">
                        <time dateTime={when.toISOString()} className="block">
                          {stamp}
                        </time>
                        <span className={`mt-0.5 block text-xs ${mute}`}>{ago(entry.at)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {workspace ? (
                          <Link href={`/workspaces/${workspace.id}`} className="font-medium">
                            {workspace.name}
                          </Link>
                        ) : (
                          <span className={mute}>Removed workspace</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{entry.action}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{entry.subject}</td>
                      <td className={`max-w-md px-4 py-3 pr-5 ${mute}`}>{entry.detail}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className={`px-5 py-8 ${mute}`}>
                    No changes recorded for this user yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <EditUserModal user={editing ? user : null} onClose={() => setEditing(false)} />
    </div>
  );
}
