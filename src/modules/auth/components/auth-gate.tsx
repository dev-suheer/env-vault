"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homePath } from "@/lib/permissions";
import { useVault } from "@/lib/store";
import { LoginScreen } from "@/modules/auth/components/login-screen";

export function AuthGate() {
  const { ready, me } = useVault();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !me) return;
    router.replace(homePath(me.role));
  }, [ready, me, router]);

  if (!ready || me) return <div className="min-h-dvh" />;
  return <LoginScreen />;
}
