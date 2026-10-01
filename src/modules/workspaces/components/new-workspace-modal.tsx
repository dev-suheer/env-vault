"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/brand/modal";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Workspace } from "@/lib/types";

export function NewWorkspaceModal({
  open,
  onClose,
  workspace = null,
}: {
  open: boolean;
  onClose: () => void;
  workspace?: Workspace | null;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {open ? <WorkspaceForm key={workspace?.id ?? "new"} workspace={workspace} onClose={onClose} /> : null}
    </Modal>
  );
}

function WorkspaceForm({ workspace, onClose }: { workspace: Workspace | null; onClose: () => void }) {
  const { createWorkspace, updateWorkspace, toast } = useVault();
  const router = useRouter();
  const editing = Boolean(workspace);
  const [name, setName] = useState(workspace?.name ?? "");
  const [desc, setDesc] = useState(workspace?.desc ?? "");

  return (
    <form
      className="fade surface max-h-[85dvh] overflow-y-auto rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
      onSubmit={(event) => {
        event.preventDefault();
        if (workspace) {
          const ok = updateWorkspace(workspace.id, { name, desc });
          if (!ok) {
            toast("Only the project manager can edit this workspace");
            return;
          }
          onClose();
          toast("Workspace updated");
          return;
        }
        const id = createWorkspace({ name, desc });
        if (!id) {
          toast("Only project managers can create workspaces");
          return;
        }
        onClose();
        router.push(`/workspaces/${id}`);
        toast("Workspace created. Add a project next.");
      }}
    >
      <h3 className="text-lg font-bold">{editing ? "Edit workspace" : "New workspace"}</h3>
      <p className={`mt-1 text-sm ${mute}`}>
        {editing ? "Update the name and description. Members and projects stay as they are." : "A shared space for one team. Add a project next, then keep env files inside that project."}
      </p>
      <label className="mt-4 block text-sm font-medium">
        Workspace name
        <input required maxLength={60} placeholder="e.g. Plesi Platform" value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${input}`} />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Description <span className="font-normal text-[#8c959f]">(optional)</span>
        <input maxLength={120} placeholder="What this workspace is for" value={desc} onChange={(event) => setDesc(event.target.value)} className={`mt-1 ${input}`} />
      </label>
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">{editing ? "Save changes" : "Create workspace"}</button>
      </div>
    </form>
  );
}
