"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { PlusIcon } from "@/components/brand/icons";
import { EmptyState } from "@/components/brand/empty-state";
import { canCreateIn, inWs, manages } from "@/lib/permissions";
import { danger, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { EnvCard } from "@/modules/envs/components/env-card";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";

export function ProjectPage() {
  const params = useParams<{ workspaceId: string; projectId: string }>();
  const router = useRouter();
  const { ready, db, me, deleteProject, toast } = useVault();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const workspace = db.workspaces.find((item) => item.id === params.workspaceId);
  const project = db.projects.find((item) => item.id === params.projectId && item.ws === params.workspaceId);

  useEffect(() => {
    if (!ready || !me) return;
    if (!workspace || !inWs(me, workspace) || !project) router.replace(workspace ? `/workspaces/${workspace.id}` : "/workspaces");
  }, [ready, me, workspace, project, router]);

  if (!me || !workspace || !project || !inWs(me, workspace)) return null;

  const envs = db.envs.filter((env) => env.project === project.id).sort((a, b) => b.updated - a.updated);
  const canManage = manages(me, workspace);

  return (
    <div className="fade">
      <Crumbs
        items={[
          { href: "/workspaces", label: "Workspaces" },
          { href: `/workspaces/${workspace.id}`, label: workspace.name },
          { label: project.name },
        ]}
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold break-words">{project.name}</h1>
          <p className={`mt-1 text-sm break-words ${mute}`}>{project.desc || "No description"}</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto">
          {canCreateIn(me, workspace) ? (
            <button type="button" className={`${primary} flex-1 sm:flex-none`} onClick={() => setOpen(true)}>
              <PlusIcon />
              New env
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className={`${danger} flex-1 sm:flex-none`} onClick={() => setConfirmDelete(true)}>
              Delete project
            </button>
          ) : null}
        </div>
      </div>
      {envs.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {envs.map((env) => (
            <EnvCard key={env.id} env={env} showOwner />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No envs in this project yet"
          text={canCreateIn(me, workspace) ? "Add the first env for this project." : "Nothing here yet."}
        />
      )}
      <NewEnvModal open={open} onClose={() => setOpen(false)} projectId={project.id} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete project"
        body={`Delete "${project.name}" and all ${envs.length} env(s) in it? This cannot be undone.`}
        confirmLabel="Delete project"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!deleteProject(project.id)) return;
          setConfirmDelete(false);
          router.push(`/workspaces/${workspace.id}`);
          toast("Project deleted");
        }}
      />
    </div>
  );
}
