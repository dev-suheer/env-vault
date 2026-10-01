"use client";

import { useState } from "react";
import { ago, dispName } from "@/lib/format";
import { card, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { InviteNotification, MemberAccess, Workspace } from "@/lib/types";
import { AccessChoice } from "@/modules/workspaces/components/access-choice";
import { InviteDevField } from "@/modules/workspaces/components/invite-dev-field";

export function InvitePanel({ workspace }: { workspace: Workspace }) {
  const { db, me, invite, cancelInvite, toast } = useVault();
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState<MemberAccess>("view");
  if (!me) return null;

  const canManage = me.role === "admin" || workspace.pm === me.email;
  const pending = db.notifs.filter((note): note is InviteNotification => note.kind === "invite" && note.ws === workspace.id && note.status === "pending");
  const invitable = db.users.filter(
    (user) => user.role === "dev" && user.active !== false && !workspace.members.includes(user.email) && !pending.some((note) => note.to === user.email),
  );

  return (
    <div className={`${card} self-start p-5 lg:col-span-2`}>
      {canManage ? (
        <>
          <h2 className="text-sm font-bold">Invite a dev</h2>
          <p className={`mt-1 text-xs ${mute}`}>They get a notification and join once they accept.</p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email) {
                toast("Choose a dev to invite");
                return;
              }
              const error = invite(workspace.id, email, access);
              if (error) {
                toast(error);
                return;
              }
              const user = db.users.find((item) => item.email === email);
              setEmail("");
              setAccess("view");
              toast(`Invite sent to ${user?.name ?? email}`);
            }}
          >
            <div>
              <p className="text-sm font-medium">Dev</p>
              <div className="mt-1">
                <InviteDevField devs={invitable} value={email} onChange={setEmail} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Access</p>
              <div className="mt-2">
                <AccessChoice label="Invite access" value={access} onChange={setAccess} />
              </div>
              <p className={`mt-2 text-xs ${mute}`}>{access === "edit" ? "They can change env files in this workspace." : "They can open env files. They can change only the ones they create."}</p>
            </div>
            <button className={`${primary} w-full sm:w-auto`}>Send invite</button>
          </form>
          {pending.length ? (
            <div className="mt-5 border-t border-line pt-4 dark:border-ink-700">
              <p className="text-xs font-semibold">Pending invites</p>
              <ul className="mt-3 space-y-3">
                {pending.map((note) => (
                  <li key={note.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{dispName(db.users, note.to)}</p>
                      <p className={`truncate text-xs ${mute}`}>
                        {note.access === "edit" ? "Edit" : "View"} · {ago(note.at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-semibold text-rose-600 dark:text-rose-400"
                      onClick={() => {
                        cancelInvite(note.id);
                        toast("Invite cancelled");
                      }}
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h2 className="text-sm font-bold">Members</h2>
          <p className={`mt-1 text-sm ${mute}`}>Only the project manager can invite or remove devs.</p>
        </>
      )}
    </div>
  );
}
