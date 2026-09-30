"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/brand/modal";
import { SelectMenu } from "@/components/brand/select-menu";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { EnvKind } from "@/lib/types";

export function NewEnvModal({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string | null }) {
  const { db, createEnv, toast } = useVault();
  const router = useRouter();
  const titleId = useId();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [env, setEnv] = useState<EnvKind>("Development");
  const project = projectId ? db.projects.find((item) => item.id === projectId) : null;
  const workspace = project ? db.workspaces.find((item) => item.id === project.ws) : null;

  function close() {
    setName("");
    setDesc("");
    setEnv("Development");
    onClose();
  }

  return (
    <Modal open={open} onClose={close}>
      <form
        className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
        onSubmit={(event) => {
          event.preventDefault();
          const id = createEnv({ name, desc, env, project: projectId });
          if (!id) {
            toast("You cannot create envs here");
            return;
          }
          close();
          router.push(`/envs/${id}`);
          toast("Env created");
        }}
      >
        <h3 id={titleId} className="text-lg font-bold">
          New env
        </h3>
        <p className={`mt-1 text-sm ${mute}`}>
          {project
            ? `Inside ${project.name}${workspace ? ` · ${workspace.name}` : ""}. Only you and the project manager can edit it.`
            : "Personal env. Only you can see it."}
        </p>
        <label className="mt-4 block text-sm font-medium">
          Name
          <input required maxLength={60} placeholder="e.g. Payments API" value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${input}`} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Description <span className="font-normal text-[#8c959f]">(optional)</span>
          <input maxLength={120} placeholder="Repo link or a short note" value={desc} onChange={(event) => setDesc(event.target.value)} className={`mt-1 ${input}`} />
        </label>
        <div className="mt-4 text-sm font-medium">
          Environment
          <SelectMenu label="Environment" value={env} options={["Development", "Staging", "Production"] as const} onChange={setEnv} />
        </div>
        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button type="button" onClick={close} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
            Cancel
          </button>
          <button className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">Create env</button>
        </div>
      </form>
    </Modal>
  );
}
