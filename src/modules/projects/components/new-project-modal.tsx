"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/brand/modal";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";

export function NewProjectModal({ open, onClose, workspaceId }: { open: boolean; onClose: () => void; workspaceId: string }) {
  const { db, createProject, toast } = useVault();
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const workspace = db.workspaces.find((item) => item.id === workspaceId);

  function close() {
    setName("");
    setDesc("");
    onClose();
  }

  return (
    <Modal open={open} onClose={close}>
      <form
        className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
        onSubmit={(event) => {
          event.preventDefault();
          const id = createProject({ name, desc, ws: workspaceId });
          if (!id) {
            toast("Only the project manager can create projects");
            return;
          }
          close();
          router.push(`/workspaces/${workspaceId}/projects/${id}`);
          toast("Project created. Add an env next.");
        }}
      >
        <h3 className="text-lg font-bold">New project</h3>
        <p className={`mt-1 text-sm ${mute}`}>
          {workspace ? `Inside ${workspace.name}. Env files for this product live here.` : "Env files for this product live here."}
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
          <button type="button" onClick={close} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
            Cancel
          </button>
          <button className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">Create project</button>
        </div>
      </form>
    </Modal>
  );
}
