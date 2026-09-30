import { AuthGate } from "@/modules/auth/components/auth-gate";

export default function Home() {
  return <AuthGate />;
}
