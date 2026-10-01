"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { PasswordField } from "@/components/brand/password-field";
import { AuthFrame, authField } from "@/modules/auth/components/auth-frame";
import { useResetChallenge } from "@/modules/auth/lib/reset";

export function ResetPassword() {
  const { finishReset, toast } = useVault();
  const router = useRouter();
  const { ready, challenge } = useResetChallenge();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!challenge) router.replace("/forgot");
    else if (!challenge.verified) router.replace("/forgot/verify");
  }, [ready, challenge, router]);

  if (!ready || !challenge?.verified) return <div className="min-h-dvh" />;

  return (
    <AuthFrame>
      <h2 className="text-2xl font-bold">Reset password</h2>
      <p className={`mt-1 text-sm ${mute}`}>Choose a new password for {challenge.email}.</p>
      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (password !== confirm) {
            setError("New password and confirmation do not match.");
            return;
          }
          const message = finishReset(password);
          if (message) {
            setError(message);
            return;
          }
          toast("Password updated. Sign in with the new one.");
          router.replace("/");
        }}
      >
        <label className="block text-sm font-medium">
          New password
          <PasswordField
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authField}
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Confirm password
          <PasswordField
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Repeat the new password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={authField}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        <button type="submit" className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Update password
        </button>
      </form>
      <Link href="/" className={`mt-4 block text-sm font-medium ${mute}`}>
        Back to sign in
      </Link>
    </AuthFrame>
  );
}
