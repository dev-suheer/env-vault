import type { Metadata } from "next";
import { PersonalEnvs } from "@/modules/envs/components/env-list";

export const metadata: Metadata = {
  title: "My envs",
};

export default function EnvsPage() {
  return <PersonalEnvs />;
}
