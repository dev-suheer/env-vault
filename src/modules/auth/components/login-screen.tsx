"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/icons";
import { homePath } from "@/lib/permissions";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { DemoAccounts } from "@/modules/auth/components/demo-accounts";
import { ThemeToggle } from "@/modules/theme/components/theme-toggle";

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
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex dark:border-r dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center gap-2 text-lg font-bold">
          <LogoMark />
          EnvVault
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">Your repo can be recloned. Your .env can&apos;t.</h1>
          <p className="mt-4 max-w-md text-slate-400">
            Project managers set up workspaces, devs join by invite, and everyone shares the same env files without pasting secrets in chat.
          </p>
          <div className="mt-8 max-w-md rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6">
            <p>
              <span className="text-[#79c0ff]">DATABASE_URL</span>
              <span className="text-slate-500">=</span>
              <span className="text-[#a5d6ff]">postgres://••••••••</span>
            </p>
            <p>
              <span className="text-[#79c0ff]">STRIPE_SECRET_KEY</span>
              <span className="text-slate-500">=</span>
              <span className="text-[#a5d6ff]">sk_live_••••••••</span>
            </p>
            <p>
              <span className="text-[#79c0ff]">JWT_SECRET</span>
              <span className="text-slate-500">=</span>
              <span className="text-[#a5d6ff]">••••••••••••</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-500">Demo build. Everything is stored in this browser only.</p>
      </div>

      <div className="relative flex items-center justify-center overflow-y-auto p-6">
        <ThemeToggle className="absolute top-4 right-4" />
        <div className="w-full max-w-sm py-10">
          <div className="mb-6 flex items-center gap-2 text-lg font-bold lg:hidden">
            <LogoMark />
            EnvVault
          </div>
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
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base sm:text-sm dark:border-ink-650 dark:bg-ink-900"
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
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base sm:text-sm dark:border-ink-650 dark:bg-ink-900"
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Password
              <input
                type="password"
                required
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base sm:text-sm dark:border-ink-650 dark:bg-ink-900"
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
          <p className={`mt-4 text-xs lg:hidden ${mute}`}>Demo build. Everything is stored in this browser only.</p>
        </div>
      </div>
    </section>
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
