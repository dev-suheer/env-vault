"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVault } from "@/lib/store";
import { AppHeader } from "@/modules/shell/components/app-header";

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, me } = useVault();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!me) {
      router.replace("/");
      return;
    }
    if (pathname === "/envs" && me.role !== "dev") router.replace("/workspaces");
    if (pathname.startsWith("/users") && me.role !== "admin") router.replace("/workspaces");
  }, [ready, me, pathname, router]);

  if (!ready || !me) return <div className="min-h-dvh" />;
  if (pathname === "/envs" && me.role !== "dev") return <div className="min-h-dvh" />;
  if (pathname.startsWith("/users") && me.role !== "admin") return <div className="min-h-dvh" />;

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
