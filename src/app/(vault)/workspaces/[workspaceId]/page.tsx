import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspacePage } from "@/modules/workspaces/components/workspace-page";

export const metadata: Metadata = {
  title: "Workspace",
};

export default function WorkspaceRoute() {
  return (
    <Suspense>
      <WorkspacePage />
    </Suspense>
  );
}
