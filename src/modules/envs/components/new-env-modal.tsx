"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/brand/modal";
import { SelectMenu } from "@/components/brand/select-menu";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { EnvFile, EnvKind } from "@/lib/types";

export function NewEnvModal({
  open,
  onClose,
  projectId,
  existing = null,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  existing?: EnvFile | null;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {open ? <EnvForm key={existing?.id ?? "new"} projectId={projectId} existing={existing} onClose={onClose} /> : null}
    </Modal>
  );
}

function EnvForm({ projectId, existing, onClose }: { projectId: string | null; existing: EnvFile | null; onClose: () => void }) {
  const { db, createEnv, updateEnv, toast } = useVault();
  const router = useRouter();
  const titleId = useId();
  const editing = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? "");
  const [desc, setDesc] = useState(existing?.desc ?? "");
  const [env, setEnv] = useState<EnvKind>(existing?.env ?? "Development");
  const project = projectId ? db.projects.find((item) => item.id === projectId) : null;
  const workspace = project ? db.workspaces.find((item) => item.id === project.ws) : null;

  return (
    <form
      className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
      onSubmit={(event) => {
        event.preventDefault();
        if (existing) {
          const ok = updateEnv(existing.id, { name, desc, env });
          if (!ok) {
            toast("You cannot edit this env");
            return;
          }
          onClose();
          toast("Env updated");
          return;
        }
        const id = createEnv({ name, desc, env, project: projectId });
        if (!id) {
          toast("You cannot create envs here");
          return;
        }
        onClose();
        router.push(`/envs/${id}`);
        toast("Env created");
      }}
    >
      <h3 id={titleId} className="text-lg font-bold">
        {editing ? "Edit env" : "New env"}
      </h3>
      <p className={`mt-1 text-sm ${mute}`}>
        {editing
          ? "Update the name, description, and environment. Variables stay as they are."
          : project
            ? `Inside ${project.name}${workspace ? ` · ${workspace.name}` : ""}. You can edit it, and so can anyone given edit access.`
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
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">{editing ? "Save changes" : "Create env"}</button>
      </div>
    </form>
  );
}
