"use client";

import { useState } from "react";
import { Modal } from "@/components/brand/modal";
import { SelectMenu } from "@/components/brand/select-menu";
import { ROLE } from "@/lib/brand";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Role, User } from "@/lib/types";

const roleLabel = { pm: "Project Manager", dev: "Dev" } as const;
const roleValue = { "Project Manager": "pm", Dev: "dev" } as const;
const statusLabel = { active: "Active", inactive: "Inactive" } as const;

export function EditUserModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  return (
    <Modal open={user !== null} onClose={onClose}>
      {user ? <UserForm key={user.email} user={user} onClose={onClose} /> : null}
    </Modal>
  );
}

function UserForm({ user, onClose }: { user: User; onClose: () => void }) {
  const { me, updateUser, toast } = useVault();
  const self = me?.email === user.email;
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role === "admin" ? "admin" : user.role);
  const [active, setActive] = useState(user.active !== false);

  return (
    <form
      className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
      onSubmit={(event) => {
        event.preventDefault();
        const message = updateUser(user.email, { name, role, active });
        if (message) {
          toast(message);
          return;
        }
        onClose();
        toast("User updated");
      }}
    >
      <h3 className="text-lg font-bold">Edit user</h3>
      <p className={`mt-1 text-sm ${mute}`}>{user.email}</p>
      <label className="mt-4 block text-sm font-medium">
        Name
        <input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${input}`} />
      </label>
      <div className="mt-4 text-sm font-medium">
        Role
        {self || user.role === "admin" ? (
          <input value={ROLE[user.role].label} disabled className={`mt-1 ${input} cursor-not-allowed bg-canvas text-mute dark:bg-ink-950`} />
        ) : (
          <SelectMenu
            label="Role"
            value={roleLabel[role === "admin" ? "dev" : role]}
            options={["Project Manager", "Dev"] as const}
            onChange={(next) => setRole(roleValue[next])}
          />
        )}
      </div>
      <div className="mt-4 text-sm font-medium">
        Status
        {self ? (
          <input value="Active" disabled className={`mt-1 ${input} cursor-not-allowed bg-canvas text-mute dark:bg-ink-950`} />
        ) : (
          <SelectMenu
            label="Status"
            value={statusLabel[active ? "active" : "inactive"]}
            options={["Active", "Inactive"] as const}
            onChange={(next) => setActive(next === "Active")}
          />
        )}
      </div>
      {self ? <p className={`mt-3 text-xs ${mute}`}>Your own role and status stay locked. There is only one admin.</p> : <p className={`mt-3 text-xs ${mute}`}>Roles are Project Manager or Dev. Admin stays a single account.</p>}
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">Save changes</button>
      </div>
    </form>
  );
}
