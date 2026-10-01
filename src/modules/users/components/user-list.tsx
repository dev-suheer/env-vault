"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/brand/avatar";
import { EyeIcon, PencilIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { plural } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { User } from "@/lib/types";
import { EditUserModal } from "@/modules/users/components/edit-user-modal";

type UserTab = "all" | "pm" | "dev";

export function UserList() {
  const { db, me } = useVault();
  const router = useRouter();
  const [editing, setEditing] = useState<User | null>(null);
  const [tab, setTab] = useState<UserTab>("all");
  if (!me) return null;

  const people = db.users.filter((user) => user.role !== "admin");
  const managers = people.filter((user) => user.role === "pm");
  const devs = people.filter((user) => user.role === "dev");
  const listed = tab === "pm" ? managers : tab === "dev" ? devs : people;
  const inactive = people.filter((user) => user.active === false).length;

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className={`mt-1 text-sm ${mute}`}>
        {plural(people.length, "account")}. {people.length - inactive} active, {inactive} inactive. An inactive account cannot sign in.
      </p>

      <div className={`${card} mt-6`}>
        <div className="tab-scroll flex gap-1 border-b border-line px-2 text-sm font-semibold dark:border-ink-700">
          {(
            [
              ["all", `All (${people.length})`],
              ["pm", `Project Managers (${managers.length})`],
              ["dev", `Users (${devs.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-3 ${tab === key ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs font-semibold tracking-wide text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400">
                {["User", "Workspaces", "Status", "Role", "Actions"].map((column) => (
                  <th key={column} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5 last:text-right">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listed.length ? (
                listed.map((user) => {
                  const active = user.active !== false;
                  const workspaceCount =
                    user.role === "pm"
                      ? db.workspaces.filter((workspace) => workspace.pm === user.email).length
                      : db.workspaces.filter((workspace) => workspace.members.includes(user.email)).length;
                  const workspaceLabel = `${plural(workspaceCount, "workspace")} ${user.role === "pm" ? "owned" : "joined"}`;
                  const href = `/users/${encodeURIComponent(user.email)}`;
                  return (
                    <tr
                      key={user.email}
                      role="link"
                      tabIndex={0}
                      aria-label={`View ${user.name}`}
                      className="cursor-pointer border-b border-[#eaeef2] last:border-0 hover:bg-[#f6f8fa] dark:border-ink-700 dark:hover:bg-ink-800/50"
                      onClick={() => router.push(href)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(href);
                        }
                      }}
                    >
                      <td className="px-4 py-3 pl-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar email={user.email} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{user.name}</p>
                            <p className={`truncate text-xs ${mute}`}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap ${mute}`}>{workspaceLabel}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                            active
                              ? "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-emerald-300"
                              : "border-line bg-canvas text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <RoleChip role={user.role} />
                      </td>
                      <td className="px-4 py-3 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg text-[#8c959f] dark:text-ink-400">
                            <EyeIcon className="h-4 w-4" />
                          </span>
                          <button
                            type="button"
                            aria-label={`Edit ${user.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing(user);
                            }}
                          >
                            <PencilIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className={`px-5 py-8 ${mute}`}>
                    No accounts in this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EditUserModal user={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
