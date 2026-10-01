import type { Metadata } from "next";
import { AuthGate } from "@/modules/auth/components/auth-gate";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function Home() {
  return <AuthGate />;
}
