"use client";

import { Avatar } from "@/components/brand/avatar";
import { RoleChip } from "@/components/brand/role-chip";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";

export function UserList() {
  const { db, me } = useVault();
  if (!me) return null;

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className={`mt-1 text-sm ${mute}`}>{db.users.length} accounts. Personal envs stay private to their owners.</p>
      <div className={`${card} mt-6`}>
        {db.users.map((user) => {
          const detail =
            user.role === "pm"
              ? `${db.workspaces.filter((workspace) => workspace.pm === user.email).length} workspace(s) owned`
              : user.role === "dev"
                ? `${db.workspaces.filter((workspace) => workspace.members.includes(user.email)).length} workspace(s) joined`
                : "Full access";
          return (
            <div key={user.email} className="flex flex-wrap items-center gap-3 border-b border-[#eaeef2] px-4 py-3 last:border-0 sm:px-5 dark:border-ink-700">
              <Avatar email={user.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user.name}
                  {user.email === me.email ? <span className={`font-normal ${mute}`}> (you)</span> : null}
                </p>
                <p className={`truncate text-xs ${mute}`}>{user.email}</p>
              </div>
              <span className={`text-xs ${mute}`}>{detail}</span>
              <RoleChip role={user.role} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
