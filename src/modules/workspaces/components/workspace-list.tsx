"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/brand/icons";
import { EmptyState } from "@/components/brand/empty-state";
import { plural } from "@/lib/format";
import { myWorkspaces } from "@/lib/permissions";
import { mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { bellCount } from "@/modules/notifications/lib/notifications";
import { NewWorkspaceModal } from "@/modules/workspaces/components/new-workspace-modal";
import { WorkspaceCard } from "@/modules/workspaces/components/workspace-card";

export function WorkspaceList() {
  const { db, me } = useVault();
  const [open, setOpen] = useState(false);
  if (!me) return null;

  const list = myWorkspaces(me, db);
  const pendingCount = me.role === "dev" ? bellCount(db.notifs.filter((note) => note.kind === "invite"), me.email) : 0;

  return (
    <div className="fade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Workspaces</h1>
          <p className={`mt-1 text-sm ${mute}`}>
            {plural(list.length, "workspace")}
            {me.role === "admin" ? " across the organization" : ""}
          </p>
        </div>
        {me.role === "pm" ? (
          <button type="button" className={`${primary} w-full sm:w-auto`} onClick={() => setOpen(true)}>
            <PlusIcon />
            New workspace
          </button>
        ) : null}
      </div>
      {list.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      ) : me.role === "pm" ? (
        <EmptyState
          title="No workspaces yet"
          text="Create a workspace, add a project, then keep env files inside that project."
          action={
            <button type="button" className={`${primary} mt-5`} onClick={() => setOpen(true)}>
              Create your first workspace
            </button>
          }
        />
      ) : me.role === "dev" ? (
        <EmptyState
          title="You have not joined a workspace yet"
          text={
            pendingCount
              ? `You have ${pendingCount} pending invite${pendingCount > 1 ? "s" : ""}. Open the bell icon to accept.`
              : "When a project manager invites you, the invite shows up under the bell icon."
          }
        />
      ) : (
        <EmptyState title="No workspaces yet" text="Workspaces created by project managers will appear here." />
      )}
      <NewWorkspaceModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
