"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { useResetChallenge } from "@/modules/auth/lib/reset";

export function VerifyCode() {
  const { requestReset, verifyReset, toast } = useVault();
  const router = useRouter();
  const { ready, challenge } = useResetChallenge();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!challenge) router.replace("/forgot");
    else if (challenge.verified) router.replace("/forgot/reset");
  }, [ready, challenge, router]);

  if (!ready || !challenge || challenge.verified) return <div className="min-h-dvh" />;

  return (
    <AuthFrame>
      <h2 className="text-2xl font-bold">Verify code</h2>
      <p className={`mt-1 text-sm ${mute}`}>Enter the 6-digit code for {challenge.email}.</p>
      <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-3 text-sm dark:border-ink-700 dark:bg-ink-950">
        <p className={mute}>This demo stays in the browser, so the code is shown here.</p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-[0.3em]">{challenge.code}</p>
      </div>
      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          const message = verifyReset(code);
          if (message) {
            setError(message);
            return;
          }
          router.push("/forgot/reset");
        }}
      >
        <CodeBoxes value={code} onChange={setCode} />
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        <button type="submit" className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Verify
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-500"
        onClick={() => {
          const message = requestReset(challenge.email);
          setCode("");
          if (message) setError(message);
          else {
            setError("");
            toast("A new code is ready.");
          }
        }}
      >
        Send a new code
      </button>
      <Link href="/forgot" className={`mt-3 block text-sm font-medium ${mute}`}>
        Use a different email
      </Link>
    </AuthFrame>
  );
}

function CodeBoxes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function apply(next: string) {
    onChange(next.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <div
      className="flex justify-between gap-2"
      onPaste={(event) => {
        event.preventDefault();
        apply(event.clipboardData.getData("text"));
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={digit}
          className="h-12 w-11 rounded-lg border border-line bg-white text-center font-mono text-lg dark:border-ink-650 dark:bg-ink-900"
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
            const chars = digits.slice();
            chars[index] = nextDigit;
            apply(chars.join(""));
            if (nextDigit && index < 5) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
