import type { Metadata } from "next";
import { EnvEditor } from "@/modules/envs/components/env-editor";

export const metadata: Metadata = {
  title: "Env",
};

export default function EnvPage() {
  return <EnvEditor />;
}
