"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVault } from "@/lib/store";
import { tabsFor } from "@/lib/permissions";

export function Subnav() {
  const { me, db } = useVault();
  const pathname = usePathname();
  if (!me) return null;

  let active = pathname.startsWith("/profile") ? "" : "workspaces";
  if (pathname.startsWith("/users")) active = "users";
  else if (pathname === "/envs") active = "personal";
  else if (pathname.startsWith("/envs/")) {
    const id = pathname.split("/")[2];
    const env = db.envs.find((item) => item.id === id);
    active = env?.ws ? "workspaces" : "personal";
  }

  return (
    <nav className="tab-scroll mx-auto flex max-w-6xl gap-1 px-4 text-sm font-semibold sm:px-6">
      {tabsFor(me.role).map((tab) => {
        const on = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 ${on ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
