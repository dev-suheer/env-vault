"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/brand/modal";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Project } from "@/lib/types";

export function NewProjectModal({
  open,
  onClose,
  workspaceId,
  project = null,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  project?: Project | null;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {open ? <ProjectForm key={project?.id ?? "new"} workspaceId={workspaceId} project={project} onClose={onClose} /> : null}
    </Modal>
  );
}

function ProjectForm({ workspaceId, project, onClose }: { workspaceId: string; project: Project | null; onClose: () => void }) {
  const { db, createProject, updateProject, toast } = useVault();
  const router = useRouter();
  const editing = Boolean(project);
  const [name, setName] = useState(project?.name ?? "");
  const [desc, setDesc] = useState(project?.desc ?? "");
  const workspace = db.workspaces.find((item) => item.id === workspaceId);

  return (
    <form
      className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
      onSubmit={(event) => {
        event.preventDefault();
        if (project) {
          const ok = updateProject(project.id, { name, desc });
          if (!ok) {
            toast("Only the project manager can edit this project");
            return;
          }
          onClose();
          toast("Project updated");
          return;
        }
        const id = createProject({ name, desc, ws: workspaceId });
        if (!id) {
          toast("Only the project manager can create projects");
          return;
        }
        onClose();
        router.push(`/workspaces/${workspaceId}/projects/${id}`);
        toast("Project created. Add an env next.");
      }}
    >
      <h3 className="text-lg font-bold">{editing ? "Edit project" : "New project"}</h3>
      <p className={`mt-1 text-sm ${mute}`}>
        {editing
          ? "Update the name and description. Env files in this project stay as they are."
          : workspace
            ? `Inside ${workspace.name}. Env files for this product live here.`
            : "Env files for this product live here."}
      </p>
      <label className="mt-4 block text-sm font-medium">
        Project name
        <input required maxLength={60} placeholder="e.g. Payments API" value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${input}`} />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Description <span className="font-normal text-[#8c959f]">(optional)</span>
        <input maxLength={120} placeholder="What this project is for" value={desc} onChange={(event) => setDesc(event.target.value)} className={`mt-1 ${input}`} />
      </label>
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">{editing ? "Save changes" : "Create project"}</button>
      </div>
    </form>
  );
}
