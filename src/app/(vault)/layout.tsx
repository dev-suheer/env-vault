import type { ReactNode } from "react";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function VaultLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
