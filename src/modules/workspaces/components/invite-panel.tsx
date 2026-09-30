"use client";

import { useState } from "react";
import { ago, dispName } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Workspace } from "@/lib/types";
import { InviteDevField } from "@/modules/workspaces/components/invite-dev-field";

export function InvitePanel({ workspace }: { workspace: Workspace }) {
  const { db, me, invite, cancelInvite, toast } = useVault();
  const [email, setEmail] = useState("");
  if (!me) return null;

  const canManage = me.role === "admin" || workspace.pm === me.email;
  const pending = db.notifs.filter((note) => note.kind === "invite" && note.ws === workspace.id && note.status === "pending");
  const invitable = db.users.filter(
    (user) => user.role === "dev" && !workspace.members.includes(user.email) && !pending.some((note) => note.to === user.email),
  );

  return (
    <div className={`${card} self-start p-5 lg:col-span-2`}>
      {canManage ? (
        <>
          <h2 className="text-sm font-bold">Invite a dev</h2>
          <p className={`mt-1 text-xs ${mute}`}>They get a notification and join once they accept.</p>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email) {
                toast("Choose a dev to invite");
                return;
              }
              const error = invite(workspace.id, email);
              if (error) {
                toast(error);
                return;
              }
              const user = db.users.find((item) => item.email === email);
              setEmail("");
              toast(`Invite sent to ${user?.name ?? email}`);
            }}
          >
            <InviteDevField devs={invitable} value={email} onChange={setEmail} />
            <button className="btn-p shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:mt-0 sm:py-2">Invite</button>
          </form>
          {pending.length ? (
            <>
              <p className={`mt-5 text-xs font-semibold ${mute}`}>Pending invites</p>
              {pending.map((note) => (
                <div key={note.id} className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    {dispName(db.users, note.to)} <span className={mute}>· {ago(note.at)}</span>
                  </span>
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
                </div>
              ))}
            </>
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
