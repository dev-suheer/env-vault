import { Suspense } from "react";
import { WorkspacePage } from "@/modules/workspaces/components/workspace-page";

export default function WorkspaceRoute() {
  return (
    <Suspense>
      <WorkspacePage />
    </Suspense>
  );
}
