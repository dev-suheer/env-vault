"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { EnvChip } from "@/components/brand/env-chip";
import { plural } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";

function readEmail(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function UserEnvsPage() {
  const params = useParams<{ email: string }>();
  const router = useRouter();
  const { db, me } = useVault();
  const email = readEmail(params.email).trim().toLowerCase();
  const user = db.users.find((item) => item.email === email);

  useEffect(() => {
    if (me?.role === "admin" && (!user || user.role === "admin")) router.replace("/users");
  }, [me, router, user]);

  if (!me || me.role !== "admin" || !user || user.role === "admin") return null;

  const envs = db.envs.filter((env) => env.owner === user.email).sort((a, b) => b.updated - a.updated);

  return (
    <div className="fade">
      <Crumbs items={[{ href: "/users", label: "Users" }, { href: `/users/${encodeURIComponent(user.email)}`, label: user.name }, { label: "Env files" }]} />
      <h1 className="mt-4 text-2xl font-extrabold">Env files</h1>
      <p className={`mt-1 text-sm ${mute}`}>
        {plural(envs.length, "file")} created by {user.name}.
      </p>
      {envs.length ? (
        <ul className={`${card} mt-6 divide-y divide-[#eaeef2] dark:divide-ink-700`}>
          {envs.map((env) => {
            const workspace = db.workspaces.find((item) => item.id === env.ws);
            return (
              <li key={env.id}>
                <Link href={`/envs/${env.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f8fa] sm:px-5 dark:hover:bg-ink-800/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{env.name}</p>
                    <p className={`mt-0.5 truncate text-xs ${mute}`}>
                      {workspace ? workspace.name : "Personal"} · {plural(env.vars.length, "variable")}
                    </p>
                  </div>
                  <EnvChip env={env.env} />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={`${card} mt-6 px-5 py-8 text-sm ${mute}`}>No env files yet.</p>
      )}
    </div>
  );
}
