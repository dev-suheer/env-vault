"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/brand/icons";
import { EmptyState } from "@/components/brand/empty-state";
import { plural } from "@/lib/format";
import { input, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { EnvGrid } from "@/modules/envs/components/env-card";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";

export function PersonalEnvs() {
  const { db, me } = useVault();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  if (!me) return null;

  const list = db.envs.filter((env) => !env.ws && env.owner === me.email);
  const total = list.reduce((count, env) => count + env.vars.length, 0);

  return (
    <div className="fade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">My envs</h1>
          <p className={`mt-1 text-sm ${mute}`}>
            Private to you. {plural(list.length, "env")} · {plural(total, "variable")}
          </p>
        </div>
        <button type="button" className={`${primary} w-full sm:w-auto`} onClick={() => setOpen(true)}>
          <PlusIcon />
          New env
        </button>
      </div>
      {list.length ? (
        <>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search envs" className={`mt-6 sm:max-w-xs ${input}`} />
          <div className="mt-4">
            <EnvGrid list={list} showOwner={false} query={query} />
          </div>
        </>
      ) : (
        <EmptyState
          title="No personal envs yet"
          text="Keep your own .env files here. Nobody else can see them."
          action={
            <button type="button" className={`${primary} mt-5`} onClick={() => setOpen(true)}>
              Create your first env
            </button>
          }
        />
      )}
      <NewEnvModal open={open} onClose={() => setOpen(false)} projectId={null} />
    </div>
  );
}
