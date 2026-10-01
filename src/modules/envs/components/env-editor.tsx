"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { EyeIcon, PencilIcon } from "@/components/brand/icons";
import { EnvChip } from "@/components/brand/env-chip";
import { dispName } from "@/lib/format";
import { canEdit, canView, homePath } from "@/lib/permissions";
import { usePageTitle } from "@/lib/title";
import { btn, card, danger, input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { copyText, downloadEnv, parseEnv, toEnv } from "@/modules/envs/lib/env-file";
import { ImportPanel } from "@/modules/envs/components/import-panel";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";
import { VariableRow } from "@/modules/envs/components/variable-row";

export function EnvEditor() {
  const params = useParams<{ envId: string }>();
  const router = useRouter();
  const { ready, db, me, toast, upsertVar, removeVar, importVars, deleteEnv } = useVault();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const env = db.envs.find((item) => item.id === params.envId);
  usePageTitle(env?.name);
  const project = env?.project ? db.projects.find((item) => item.id === env.project) : null;
  const workspace = env?.ws ? db.workspaces.find((item) => item.id === env.ws) : null;

  useEffect(() => {
    if (!ready || !me) return;
    if (!env || !canView(me, env, db)) {
      router.replace(env?.ws ? "/workspaces" : homePath(me.role));
    }
  }, [ready, me, env, db, router]);

  if (!me || !env || !canView(me, env, db)) return null;

  const edit = canEdit(me, env, db);
  const ownerName = dispName(db.users, env.owner);

  async function copy(text: string, message: string) {
    try {
      await copyText(text);
      toast(message);
    } catch {
      toast("Copy failed. Allow clipboard access.");
    }
  }

  const parentHref = project && workspace ? `/workspaces/${workspace.id}/projects/${project.id}` : "/envs";

  return (
    <div className="fade">
      <Crumbs
        items={
          project && workspace
            ? [
                { href: "/workspaces", label: "Workspaces" },
                { href: `/workspaces/${workspace.id}`, label: workspace.name },
                { href: `/workspaces/${workspace.id}/projects/${project.id}`, label: project.name },
                { label: env.name },
              ]
            : [
                { href: "/envs", label: "My envs" },
                { label: env.name },
              ]
        }
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-1">
            <h1 className="text-2xl font-extrabold break-words">{env.name}</h1>
            {edit ? (
              <button
                type="button"
                aria-label="Edit env"
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                onClick={() => setEditing(true)}
              >
                <PencilIcon />
              </button>
            ) : null}
          </div>
          <div className={`mt-2 flex flex-wrap items-center gap-2 text-sm ${mute}`}>
            <EnvChip env={env.env} />
            {env.desc ? <span className="break-words">{env.desc}</span> : null}
            <span>· by {ownerName}</span>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto">
          <button type="button" className={`${btn} flex-1 sm:flex-none`} onClick={() => (env.vars.length ? copy(toEnv(env.vars), ".env copied") : toast("Nothing to copy yet"))}>
            Copy as .env
          </button>
          <button
            type="button"
            className={`${btn} flex-1 sm:flex-none`}
            onClick={async () => {
              const result = await downloadEnv(toEnv(env.vars));
              if (result === "cancelled") return;
              if (result !== "saved" && result !== "downloaded") toast("Download failed.");
            }}
          >
            Download .env
          </button>
          {edit ? (
            <button type="button" className={`${danger} flex-1 sm:flex-none`} onClick={() => setConfirmDelete(true)}>
              Delete env
            </button>
          ) : null}
        </div>
      </div>

      {edit ? null : (
        <div className={`mt-5 flex items-start gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-sm ${mute} dark:border-ink-700 dark:bg-ink-900`}>
          <EyeIcon />
          <span>
            <b className="font-semibold text-fg dark:text-ink-100">View only</b>
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className={`${card} flex h-full flex-col ${edit ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 dark:border-ink-700">
            <h2 className="text-sm font-bold">Variables ({env.vars.length})</h2>
            <button
              type="button"
              className="text-sm font-semibold text-brand-700 dark:text-brand-500"
              onClick={() => {
                if (revealed.size) setRevealed(new Set());
                else setRevealed(new Set(env.vars.map((item) => item.k)));
              }}
            >
              {revealed.size ? "Hide all" : "Reveal all"}
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {env.vars.length ? (
              env.vars.map((item) => (
                <VariableRow
                  key={item.k}
                  name={item.k}
                  value={item.v}
                  shown={revealed.has(item.k)}
                  edit={edit}
                  onToggle={() => {
                    setRevealed((current) => {
                      const next = new Set(current);
                      if (next.has(item.k)) next.delete(item.k);
                      else next.add(item.k);
                      return next;
                    });
                  }}
                  onCopy={() => copy(item.v, "Value copied")}
                  onRemove={() => {
                    if (!removeVar(env.id, item.k)) {
                      toast("You can only view this env");
                      return;
                    }
                    setRevealed((current) => {
                      const next = new Set(current);
                      next.delete(item.k);
                      return next;
                    });
                    toast("Variable removed");
                  }}
                />
              ))
            ) : (
              <p className={`px-5 py-10 text-center text-sm ${mute}`}>No variables yet.</p>
            )}
          </div>
          {edit ? (
            <form
              className="mt-auto flex flex-col gap-2 rounded-b-xl border-t border-line bg-canvas p-4 sm:flex-row sm:items-center dark:border-ink-700 dark:bg-ink-950/60"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const key = String(data.get("key") ?? "").trim();
                const value = String(data.get("value") ?? "");
                if (!upsertVar(env.id, key, value)) {
                  toast("You can only view this env");
                  return;
                }
                const form = event.currentTarget;
                form.reset();
                const field = form.querySelector("input");
                if (field instanceof HTMLInputElement) field.focus();
                toast("Variable saved");
              }}
            >
              <input
                name="key"
                required
                placeholder="KEY"
                pattern="[A-Za-z_][A-Za-z0-9_]*"
                title="Letters, numbers and underscores only"
                className={`font-mono sm:min-w-0 sm:flex-1 sm:basis-32 ${input}`}
              />
              <input name="value" placeholder="value" className={`font-mono sm:min-w-0 sm:flex-[2] sm:basis-40 ${input}`} />
              <button className="btn-p rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:py-2">Add</button>
            </form>
          ) : null}
        </div>
        {edit ? (
          <ImportPanel
            onImport={(text) => {
              const pairs = parseEnv(text);
              if (!pairs.length) {
                toast("No KEY=value lines found");
                return false;
              }
              if (!importVars(env.id, pairs)) {
                toast("You can only view this env");
                return false;
              }
              toast(`${pairs.length} variable${pairs.length > 1 ? "s" : ""} imported`);
              return true;
            }}
          />
        ) : null}
      </div>
      {edit ? <NewEnvModal open={editing} onClose={() => setEditing(false)} projectId={env.project} existing={env} /> : null}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete env"
        body={`Delete "${env.name}" and all its variables? This cannot be undone.`}
        confirmLabel="Delete env"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!deleteEnv(env.id)) {
            toast("You can only view this env");
            setConfirmDelete(false);
            return;
          }
          setConfirmDelete(false);
          router.push(parentHref);
          toast("Env deleted");
        }}
      />
    </div>
  );
}
