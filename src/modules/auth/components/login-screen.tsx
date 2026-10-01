"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { homePath } from "@/lib/permissions";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { PasswordField } from "@/components/brand/password-field";
import { AuthFrame, authField, authInput } from "@/modules/auth/components/auth-frame";
import { DemoAccounts } from "@/modules/auth/components/demo-accounts";

export function LoginScreen() {
  const { login, signup } = useVault();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function enter(role: "admin" | "pm" | "dev") {
    router.replace(homePath(role));
  }

  return (
    <AuthFrame>
          <div className="flex rounded-lg border border-line bg-canvas p-1 text-sm font-semibold dark:border-ink-700 dark:bg-ink-950">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`flex-1 rounded-md px-3 py-1.5 ${mode === item ? "bg-white shadow-sm dark:bg-ink-800" : mute}`}
                onClick={() => {
                  setMode(item);
                  setError("");
                }}
              >
                {item === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              if (mode === "login") {
                const result = login(email, password);
                if (result.error || !result.role) {
                  setError(result.error ?? "Wrong email or password.");
                  return;
                }
                enter(result.role);
                return;
              }
              const role = data.get("role");
              const message = signup({
                name: String(data.get("name") ?? ""),
                email,
                password,
                role: role === "pm" ? "pm" : "dev",
              });
              if (message) {
                setError(message);
                return;
              }
              enter(role === "pm" ? "pm" : "dev");
            }}
          >
            <h2 className="text-2xl font-bold">{mode === "login" ? "Sign in" : "Create your account"}</h2>
            <p className={`mt-1 text-sm ${mute}`}>{mode === "login" ? "Welcome back." : "Pick the role that matches your job."}</p>

            {mode === "signup" ? (
              <label className="mt-5 block text-sm font-medium">
                Full name
                <input
                  name="name"
                  required
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className={authInput}
                />
              </label>
            ) : null}

            <label className="mt-4 block text-sm font-medium">
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
            <label className="mt-4 block text-sm font-medium">
              Password
              <PasswordField
                required
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={authField}
              />
            </label>

            {mode === "signup" ? (
              <fieldset className="mt-4">
                <legend className="text-sm font-medium">Your role</legend>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <RoleChoice value="pm" title="Project Manager" text="Create workspaces and invite devs" />
                  <RoleChoice value="dev" title="Dev" text="Personal envs and join workspaces" defaultChecked />
                </div>
              </fieldset>
            ) : null}

            {mode === "login" ? (
              <div className="mt-3 text-right">
                <Link href="/forgot" className="text-sm font-semibold text-brand-700 dark:text-brand-500">
                  Forgot password?
                </Link>
              </div>
            ) : null}

            {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
            <button type="submit" className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "login" ? (
            <DemoAccounts
              onPick={(next) => {
                setEmail(next);
                setPassword("demo1234");
                setError("");
              }}
            />
          ) : null}
    </AuthFrame>
  );
}

function RoleChoice({ value, title, text, defaultChecked }: { value: "pm" | "dev"; title: string; text: string; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name="role" value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="block h-full rounded-lg border border-line bg-white p-3 text-sm peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/25 dark:border-ink-650 dark:bg-ink-900">
        <b className="block font-semibold">{title}</b>
        <span className={`text-xs ${mute}`}>{text}</span>
      </span>
    </label>
  );
}
