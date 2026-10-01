"use client";

import { useRef, useState } from "react";
import { UserPhoto } from "@/components/brand/avatar";
import { PasswordField } from "@/components/brand/password-field";
import { RoleChip } from "@/components/brand/role-chip";
import { ROLE } from "@/lib/brand";
import { btn, card, input, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { resizePhoto } from "@/modules/profile/lib/photo";

const locked = `${input} cursor-not-allowed bg-canvas text-mute dark:bg-ink-950`;

export function ProfilePage() {
  const { me, toast, updateProfile } = useVault();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"details" | "password">("details");
  const [name, setName] = useState(me?.name ?? "");
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [image, setImage] = useState<string | null>(me?.image ?? null);
  if (!me) return null;

  const dirty = name.trim() !== me.name || phone.trim() !== me.phone || image !== me.image;

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className={`mt-1 text-sm ${mute}`}>Update your photo, name, and phone, or change your password. Email and role cannot be changed.</p>
      <div className="tab-scroll mt-6 flex gap-1 border-b border-line text-sm font-semibold dark:border-ink-700">
        {(
          [
            ["details", "Details"],
            ["password", "Password"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 ${tab === key ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "password" ? <PasswordForm /> : null}
      {tab === "details" ? (
      <form
        className={`${card} mt-6 overflow-hidden`}
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) {
            toast("Name is required");
            return;
          }
          if (!updateProfile({ name, phone, image })) {
            toast("Could not save your profile");
            return;
          }
          toast("Profile saved");
        }}
      >
        <div className="flex flex-col gap-5 border-b border-line px-5 py-6 sm:flex-row sm:items-center sm:px-8 dark:border-ink-700">
          <UserPhoto name={name.trim() || me.name} image={image} className="h-24 w-24 text-3xl" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold">{name.trim() || me.name}</h2>
            <p className={`mt-0.5 truncate text-sm ${mute}`}>{me.email}</p>
            <div className="mt-3">
              <RoleChip role={me.role} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
              Change photo
            </button>
            {image ? (
              <button type="button" className={btn} onClick={() => setImage(null)}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (!file.type.startsWith("image/")) {
                toast("Choose an image file");
                return;
              }
              try {
                setImage(await resizePhoto(file));
              } catch {
                toast("Could not read that image");
              }
            }}
          />
        </div>

        <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2">
          <section>
            <h3 className="text-sm font-bold">Personal details</h3>
            <p className={`mt-1 text-xs ${mute}`}>Your name and phone. The photo above is the one shown on your account.</p>
            <label className="mt-5 block text-sm font-medium">
              Name
              <input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${input}`} />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Phone number
              <input type="tel" maxLength={24} placeholder="e.g. +1 555 0100" value={phone} onChange={(event) => setPhone(event.target.value)} className={`mt-1 ${input}`} />
            </label>
          </section>
          <section>
            <h3 className="text-sm font-bold">Account</h3>
            <p className={`mt-1 text-xs ${mute}`}>Email and role belong to the account and stay read only.</p>
            <label className="mt-5 block text-sm font-medium">
              Email
              <input value={me.email} disabled className={`mt-1 ${locked}`} />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Role
              <input value={ROLE[me.role].label} disabled className={`mt-1 ${locked}`} />
            </label>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-8 dark:border-ink-700">
          <p className={`text-xs ${mute}`}>{dirty ? "You have unsaved changes." : "All changes are saved."}</p>
          <button className={`${primary} disabled:cursor-not-allowed disabled:opacity-50`} disabled={!dirty}>
            Save profile
          </button>
        </div>
      </form>
      ) : null}
    </div>
  );
}

function PasswordForm() {
  const { changePassword, toast } = useVault();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const longEnough = next.length >= 6;
  const matches = next.length > 0 && next === confirm;
  const different = next.length > 0 && next !== current;

  return (
    <form
      className={`${card} mt-6 overflow-hidden`}
      onSubmit={(event) => {
        event.preventDefault();
        if (next !== confirm) {
          setError("New password and confirmation do not match.");
          return;
        }
        const message = changePassword({ current, next });
        if (message) {
          setError(message);
          return;
        }
        setCurrent("");
        setNext("");
        setConfirm("");
        setError("");
        toast("Password updated");
      }}
    >
      <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-bold">Change password</h2>
          <p className={`mt-1 text-xs ${mute}`}>Enter your current password, then choose a new one.</p>
          <label className="mt-5 block text-sm font-medium">
            Current password
            <PasswordField required autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            New password
            <PasswordField required minLength={6} autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Confirm new password
            <PasswordField required minLength={6} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </label>
          {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        </section>
        <section>
          <h2 className="text-sm font-bold">Requirements</h2>
          <ul className={`mt-3 space-y-2 text-sm ${mute}`}>
            <li className={longEnough ? "text-brand-700 dark:text-brand-500" : ""}>At least 6 characters</li>
            <li className={different ? "text-brand-700 dark:text-brand-500" : ""}>Different from the current password</li>
            <li className={matches ? "text-brand-700 dark:text-brand-500" : ""}>Confirmation matches the new password</li>
          </ul>
        </section>
      </div>
      <div className="flex justify-end border-t border-line px-5 py-4 sm:px-8 dark:border-ink-700">
        <button className={primary}>Update password</button>
      </div>
    </form>
  );
}
