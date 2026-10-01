import type { Metadata } from "next";
import { ProjectPage } from "@/modules/projects/components/project-page";

export const metadata: Metadata = {
  title: "Project",
};

export default function ProjectRoute() {
  return <ProjectPage />;
}
