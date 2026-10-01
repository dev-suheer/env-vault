"use client";

import { useState } from "react";
import { Avatar } from "@/components/brand/avatar";
import { TrashIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { dispName } from "@/lib/format";
import { btn, card, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { MemberAccess, Workspace } from "@/lib/types";
import { AccessChoice } from "@/modules/workspaces/components/access-choice";

function savedAccess(workspace: Workspace, email: string): MemberAccess {
  return workspace.editors?.includes(email) ? "edit" : "view";
}

export function MemberList({ workspace, canManage }: { workspace: Workspace; canManage: boolean }) {
  const { db, me, removeMember, setMemberAccess, toast } = useVault();
  const [draft, setDraft] = useState<Record<string, MemberAccess> | null>(null);
  if (!me) return null;

  function accessFor(email: string): MemberAccess {
    return draft?.[email] ?? savedAccess(workspace, email);
  }

  const dirty = workspace.members.filter((email) => accessFor(email) !== savedAccess(workspace, email));

  function save() {
    const failed = dirty.some((email) => !setMemberAccess(workspace.id, email, accessFor(email)));
    if (failed) {
      toast("Only the project manager can change access");
      return;
    }
    setDraft(null);
    toast(dirty.length === 1 ? "Access saved" : "Access saved for the updated members");
  }

  return (
    <div className={`${card} lg:col-span-3`}>
      <div className="border-b border-line px-5 py-4 dark:border-ink-700">
        <h2 className="text-sm font-bold">People ({workspace.members.length + 1})</h2>
        <p className={`mt-1 text-xs ${mute}`}>{canManage ? "Choose who can change env files, then save." : "People in this workspace."}</p>
      </div>
      <MemberRow email={workspace.pm} you={workspace.pm === me.email} note="Workspace owner" role="pm" />
      {workspace.members.map((email) => (
        <div key={email} className="flex flex-col gap-3 border-b border-[#eaeef2] px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:px-5 dark:border-ink-700">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar email={email} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {dispName(db.users, email)}
                  {email === me.email ? <span className={`font-normal ${mute}`}> (you)</span> : null}
                </p>
                <RoleChip role="dev" />
              </div>
              <p className={`truncate text-xs ${mute}`}>{email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {canManage ? (
              <AccessChoice
                label={`Access for ${dispName(db.users, email)}`}
                value={accessFor(email)}
                onChange={(access) => setDraft((current) => ({ ...(current ?? {}), [email]: access }))}
              />
            ) : (
              <span className={`text-xs font-medium ${mute}`}>{accessFor(email) === "edit" ? "Can edit" : "Can view"}</span>
            )}
            {canManage ? (
              <button
                type="button"
                aria-label={`Remove ${dispName(db.users, email)}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={() => {
                  if (!confirm(`Remove ${dispName(db.users, email)} from ${workspace.name}? They will lose access to its envs.`)) return;
                  if (!removeMember(workspace.id, email)) return;
                  setDraft((current) => {
                    if (!current) return current;
                    const next = { ...current };
                    delete next[email];
                    return next;
                  });
                  toast("Member removed");
                }}
              >
                <TrashIcon />
              </button>
            ) : null}
          </div>
        </div>
      ))}
      {canManage && dirty.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 dark:border-ink-700">
          <p className={`text-xs ${mute}`}>Access changes are not saved yet.</p>
          <div className="flex gap-2">
            <button type="button" className={btn} onClick={() => setDraft(null)}>
              Discard
            </button>
            <button type="button" className={primary} onClick={save}>
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MemberRow({ email, you, note, role }: { email: string; you: boolean; note: string; role: "pm" | "dev" }) {
  const { db } = useVault();
  return (
    <div className="flex items-center gap-3 border-b border-[#eaeef2] px-4 py-4 sm:px-5 dark:border-ink-700">
      <Avatar email={email} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold">
            {dispName(db.users, email)}
            {you ? <span className={`font-normal ${mute}`}> (you)</span> : null}
          </p>
          <RoleChip role={role} />
        </div>
        <p className={`truncate text-xs ${mute}`}>
          {email}
          <span> · {note}</span>
        </p>
      </div>
    </div>
  );
}
