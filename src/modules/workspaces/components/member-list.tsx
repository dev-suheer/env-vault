"use client";

import { Avatar } from "@/components/brand/avatar";
import { RoleChip } from "@/components/brand/role-chip";
import { dispName } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Workspace } from "@/lib/types";

export function MemberList({ workspace, canManage }: { workspace: Workspace; canManage: boolean }) {
  const { db, me, removeMember, toast } = useVault();
  if (!me) return null;

  function person(email: string, role: "pm" | "dev", removable: boolean) {
    return (
      <div key={email} className="flex flex-wrap items-center gap-3 border-b border-[#eaeef2] px-4 py-3 last:border-0 sm:px-5 dark:border-ink-700">
        <Avatar email={email} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {dispName(db.users, email)}
            {email === me!.email ? <span className={`font-normal ${mute}`}> (you)</span> : null}
          </p>
          <p className={`truncate text-xs ${mute}`}>{email}</p>
        </div>
        {role === "pm" ? <span className={`text-xs ${mute}`}>Workspace owner</span> : null}
        <RoleChip role={role} />
        {removable ? (
          <button
            type="button"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
            onClick={() => {
              if (!confirm(`Remove ${dispName(db.users, email)} from ${workspace.name}? They will lose access to its envs.`)) return;
              if (!removeMember(workspace.id, email)) return;
              toast("Member removed");
            }}
          >
            Remove
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${card} lg:col-span-3`}>
      <div className="border-b border-line px-5 py-3 dark:border-ink-700">
        <h2 className="text-sm font-bold">People ({workspace.members.length + 1})</h2>
      </div>
      {person(workspace.pm, "pm", false)}
      {workspace.members.map((email) => person(email, "dev", canManage))}
    </div>
  );
}
