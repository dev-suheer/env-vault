"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { AuthFrame, authInput } from "@/modules/auth/components/auth-frame";
import { useResetChallenge } from "@/modules/auth/lib/reset";

export function ForgotPassword() {
  const { requestReset } = useVault();
  const router = useRouter();
  const { challenge } = useResetChallenge();
  const [email, setEmail] = useState(challenge?.email ?? "");
  const [error, setError] = useState("");

  return (
    <AuthFrame>
      <h2 className="text-2xl font-bold">Forgot password</h2>
      <p className={`mt-1 text-sm ${mute}`}>Enter the email on your account. The next screen gives you a code to verify it.</p>
      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          const message = requestReset(email);
          if (message) {
            setError(message);
            return;
          }
          router.push("/forgot/verify");
        }}
      >
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            placeholder="you@company.com"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={authInput}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        <button type="submit" className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Send code
        </button>
      </form>
      {challenge && !challenge.verified ? (
        <Link href="/forgot/verify" className="mt-4 block text-sm font-semibold text-brand-700 dark:text-brand-500">
          Continue with the code already sent
        </Link>
      ) : null}
      <Link href="/" className={`mt-4 block text-sm font-medium ${mute}`}>
        Back to sign in
      </Link>
    </AuthFrame>
  );
}
