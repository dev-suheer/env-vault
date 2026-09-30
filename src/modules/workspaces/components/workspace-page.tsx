"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { PlusIcon } from "@/components/brand/icons";
import { EmptyState } from "@/components/brand/empty-state";
import { dispName } from "@/lib/format";
import { inWs, manages } from "@/lib/permissions";
import { danger, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { NewProjectModal } from "@/modules/projects/components/new-project-modal";
import { ProjectCard } from "@/modules/projects/components/project-card";
import { InvitePanel } from "@/modules/workspaces/components/invite-panel";
import { MemberList } from "@/modules/workspaces/components/member-list";

export function WorkspacePage() {
  const params = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ready, db, me, deleteWorkspace, toast } = useVault();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const workspace = db.workspaces.find((item) => item.id === params.workspaceId);
  const tab = searchParams.get("tab") === "members" ? "members" : "projects";

  useEffect(() => {
    if (!ready || !me) return;
    if (!workspace || !inWs(me, workspace)) router.replace("/workspaces");
  }, [ready, me, workspace, router]);

  if (!me || !workspace || !inWs(me, workspace)) return null;

  const projects = db.projects.filter((project) => project.ws === workspace.id);
  const envCount = db.envs.filter((env) => env.ws === workspace.id).length;
  const canManage = manages(me, workspace);

  function setTab(next: "projects" | "members") {
    const query = next === "members" ? "?tab=members" : "";
    router.replace(`/workspaces/${workspace!.id}${query}`);
  }

  return (
    <div className="fade">
      <Crumbs items={[{ href: "/workspaces", label: "Workspaces" }, { label: workspace.name }]} />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold break-words">{workspace.name}</h1>
          <p className={`mt-1 text-sm break-words ${mute}`}>
            {workspace.desc || "No description"} · PM: {dispName(db.users, workspace.pm)}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto">
          {canManage ? (
            <button type="button" className={`${primary} flex-1 sm:flex-none`} onClick={() => setOpen(true)}>
              <PlusIcon />
              New project
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className={`${danger} flex-1 sm:flex-none`} onClick={() => setConfirmDelete(true)}>
              Delete workspace
            </button>
          ) : null}
        </div>
      </div>

      <div className="tab-scroll mt-6 flex gap-1 border-b border-line text-sm font-semibold dark:border-ink-700">
        {(
          [
            ["projects", `Projects (${projects.length})`],
            ["members", `Members (${workspace.members.length + 1})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 ${tab === key ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "projects" ? (
        projects.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            text={canManage ? "Create a project, then add env files inside it." : "The project manager adds projects. Envs live inside a project."}
          />
        )
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <MemberList workspace={workspace} canManage={canManage} />
          <InvitePanel workspace={workspace} />
        </div>
      )}
      <NewProjectModal open={open} onClose={() => setOpen(false)} workspaceId={workspace.id} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete workspace"
        body={`Delete "${workspace.name}", its ${projects.length} project(s), and ${envCount} env(s)? This cannot be undone.`}
        confirmLabel="Delete workspace"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!deleteWorkspace(workspace.id)) return;
          setConfirmDelete(false);
          router.push("/workspaces");
          toast("Workspace deleted");
        }}
      />
    </div>
  );
}
