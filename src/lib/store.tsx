"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useSyncExternalStore, useState, type ReactNode } from "react";
import { DB_KEY, load, save } from "@/lib/db";
import { uid } from "@/lib/format";
import { canCreateIn, canEdit } from "@/lib/permissions";
import { SESSION_KEY } from "@/modules/auth/lib/session";
import type { DB, EnvKind, User } from "@/lib/types";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: "pm" | "dev";
};

type InviteResult =
  | { status: "joined"; workspaceId: string; name: string }
  | { status: "declined" }
  | { status: "missing" };

type VaultContextValue = {
  ready: boolean;
  db: DB;
  me: User | null;
  toastMessage: string | null;
  toast: (message: string) => void;
  login: (email: string, password: string) => { error: string | null; role: User["role"] | null };
  signup: (input: SignupInput) => string | null;
  logout: () => void;
  createEnv: (input: { name: string; desc: string; env: EnvKind; project: string | null }) => string | null;
  createProject: (input: { name: string; desc: string; ws: string }) => string | null;
  deleteProject: (id: string) => boolean;
  deleteEnv: (id: string) => boolean;
  upsertVar: (envId: string, key: string, value: string) => boolean;
  removeVar: (envId: string, key: string) => boolean;
  importVars: (envId: string, pairs: { k: string; v: string }[]) => boolean;
  createWorkspace: (input: { name: string; desc: string }) => string | null;
  deleteWorkspace: (id: string) => boolean;
  invite: (workspaceId: string, email: string) => string | null;
  cancelInvite: (id: string) => void;
  respondInvite: (id: string, accept: boolean) => InviteResult;
  removeMember: (workspaceId: string, email: string) => boolean;
  markInfoRead: () => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

const emptyDb = (): DB => ({ users: [], workspaces: [], projects: [], envs: [], notifs: [] });

type Snapshot = { ready: boolean; db: DB; email: string | null };

const serverSnapshot: Snapshot = { ready: false, db: emptyDb(), email: null };
let snapshot: Snapshot = serverSnapshot;
let cachedRaw: string | null = null;
const listeners = new Set<() => void>();

function readEmail() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function readDb() {
  if (typeof window === "undefined") return snapshot.db;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(DB_KEY);
  } catch {
    return snapshot.db;
  }
  if (snapshot.ready && raw === cachedRaw) return snapshot.db;
  const db = load();
  try {
    cachedRaw = localStorage.getItem(DB_KEY);
  } catch {
    cachedRaw = raw;
  }
  return db;
}

function liveDb() {
  return snapshot.ready ? snapshot.db : readDb();
}

function liveEmail() {
  return snapshot.ready ? snapshot.email : readEmail();
}

function publish(db: DB, email: string | null) {
  try {
    cachedRaw = localStorage.getItem(DB_KEY);
  } catch {
    cachedRaw = JSON.stringify(db);
  }
  snapshot = { ready: true, db, email };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== DB_KEY) return;
    cachedRaw = null;
    snapshot = { ready: true, db: load(), email: readEmail() };
    try {
      cachedRaw = localStorage.getItem(DB_KEY);
    } catch {
      cachedRaw = null;
    }
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getClientSnapshot() {
  const db = readDb();
  const email = readEmail();
  if (snapshot.ready && snapshot.db === db && snapshot.email === email) return snapshot;
  snapshot = { ready: true, db, email };
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function Providers({ children }: { children: ReactNode }) {
  const { ready, db, email: sessionEmail } = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const me = sessionEmail ? db.users.find((user) => user.email === sessionEmail) ?? null : null;

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2400);
  }, []);

  const commit = useCallback((recipe: (draft: DB) => void) => {
    const next = structuredClone(liveDb());
    recipe(next);
    try {
      save(next);
    } catch {
      setToastMessage("Could not save. Browser storage is unavailable.");
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToastMessage(null), 2400);
      return false;
    }
    publish(next, liveEmail());
    return true;
  }, []);

  const currentUser = useCallback(() => {
    const email = liveEmail();
    if (!email) return null;
    return liveDb().users.find((user) => user.email === email) ?? null;
  }, []);

  const login = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const user = liveDb().users.find((item) => item.email === normalized);
    if (!user || user.password !== password) return { error: "Wrong email or password.", role: null };
    try {
      sessionStorage.setItem(SESSION_KEY, user.email);
    } catch {
      /* session still lives in memory for this tab */
    }
    publish(liveDb(), user.email);
    return { error: null, role: user.role };
  }, []);

  const signup = useCallback(
    (input: SignupInput) => {
      const email = input.email.trim().toLowerCase();
      if (liveDb().users.some((user) => user.email === email)) {
        return "An account with this email already exists. Sign in instead.";
      }
      if (input.password.length < 6) return "Use a password with at least 6 characters.";
      if (input.role !== "pm" && input.role !== "dev") return "Choose Project Manager or Dev.";
      const user: User = { email, name: input.name.trim(), role: input.role, password: input.password };
      if (!commit((draft) => draft.users.push(user))) return "Could not save. Browser storage is unavailable.";
      try {
        sessionStorage.setItem(SESSION_KEY, user.email);
      } catch {
        /* session still lives in memory for this tab */
      }
      publish(liveDb(), user.email);
      return null;
    },
    [commit],
  );

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    publish(liveDb(), null);
  }, []);

  const createEnv = useCallback(
    (input: { name: string; desc: string; env: EnvKind; project: string | null }) => {
      const user = currentUser();
      if (!user) return null;
      const project = input.project ? liveDb().projects.find((item) => item.id === input.project) : null;
      if (input.project) {
        const workspace = project ? liveDb().workspaces.find((item) => item.id === project.ws) : null;
        if (!project || !workspace || !canCreateIn(user, workspace)) return null;
      } else if (user.role !== "dev") {
        return null;
      }
      const id = uid();
      const ok = commit((draft) => {
        draft.envs.unshift({
          id,
          name: input.name.trim(),
          desc: input.desc.trim(),
          env: input.env,
          vars: [],
          updated: Date.now(),
          owner: user.email,
          ws: project ? project.ws : null,
          project: project ? project.id : null,
        });
      });
      return ok ? id : null;
    },
    [commit, currentUser],
  );

  const deleteEnv = useCallback(
    (id: string) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === id);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => {
        draft.envs = draft.envs.filter((item) => item.id !== id);
      });
    },
    [commit, currentUser],
  );

  const touchEnv = (draft: DB, envId: string, key: string, value: string | null) => {
    const env = draft.envs.find((item) => item.id === envId);
    if (!env) return;
    if (value === null) env.vars = env.vars.filter((item) => item.k !== key);
    else {
      const existing = env.vars.find((item) => item.k === key);
      if (existing) existing.v = value;
      else env.vars.push({ k: key, v: value });
    }
    env.updated = Date.now();
  };

  const upsertVar = useCallback(
    (envId: string, key: string, value: string) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === envId);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => touchEnv(draft, envId, key, value));
    },
    [commit, currentUser],
  );

  const removeVar = useCallback(
    (envId: string, key: string) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === envId);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => touchEnv(draft, envId, key, null));
    },
    [commit, currentUser],
  );

  const importVars = useCallback(
    (envId: string, pairs: { k: string; v: string }[]) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === envId);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => {
        pairs.forEach((pair) => touchEnv(draft, envId, pair.k, pair.v));
      });
    },
    [commit, currentUser],
  );

  const createWorkspace = useCallback(
    (input: { name: string; desc: string }) => {
      const user = currentUser();
      if (!user || user.role !== "pm") return null;
      const id = uid();
      const ok = commit((draft) => {
        draft.workspaces.unshift({
          id,
          name: input.name.trim(),
          desc: input.desc.trim(),
          pm: user.email,
          members: [],
          created: Date.now(),
        });
      });
      return ok ? id : null;
    },
    [commit, currentUser],
  );

  const deleteWorkspace = useCallback(
    (id: string) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === id);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        draft.envs = draft.envs.filter((env) => env.ws !== id);
        draft.projects = draft.projects.filter((project) => project.ws !== id);
        draft.notifs = draft.notifs.filter((note) => !("ws" in note) || note.ws !== id);
        draft.workspaces = draft.workspaces.filter((item) => item.id !== id);
      });
    },
    [commit, currentUser],
  );

  const createProject = useCallback(
    (input: { name: string; desc: string; ws: string }) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === input.ws);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return null;
      const id = uid();
      const ok = commit((draft) => {
        draft.projects.unshift({
          id,
          ws: workspace.id,
          name: input.name.trim(),
          desc: input.desc.trim(),
          owner: user.email,
          created: Date.now(),
        });
      });
      return ok ? id : null;
    },
    [commit, currentUser],
  );

  const deleteProject = useCallback(
    (id: string) => {
      const user = currentUser();
      const project = liveDb().projects.find((item) => item.id === id);
      const workspace = project ? liveDb().workspaces.find((item) => item.id === project.ws) : null;
      if (!user || !project || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        draft.envs = draft.envs.filter((env) => env.project !== id);
        draft.projects = draft.projects.filter((item) => item.id !== id);
      });
    },
    [commit, currentUser],
  );

  const invite = useCallback(
    (workspaceId: string, email: string) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === workspaceId);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return "You cannot invite from here";
      const normalized = email.trim().toLowerCase();
      const target = liveDb().users.find((item) => item.email === normalized);
      if (!target) return "No account with that email";
      if (target.role !== "dev") return "Only Dev accounts can be invited";
      if (workspace.members.includes(normalized)) return "Already in this workspace";
      const pending = liveDb().notifs.some(
        (note) => note.kind === "invite" && note.ws === workspace.id && note.to === normalized && note.status === "pending",
      );
      if (pending) return "Invite already sent";
      commit((draft) => {
        draft.notifs.push({
          id: uid(),
          kind: "invite",
          to: normalized,
          from: user.email,
          ws: workspace.id,
          wsName: workspace.name,
          status: "pending",
          read: false,
          at: Date.now(),
        });
      });
      return null;
    },
    [commit, currentUser],
  );

  const cancelInvite = useCallback(
    (id: string) => {
      commit((draft) => {
        draft.notifs = draft.notifs.filter((note) => note.id !== id);
      });
    },
    [commit],
  );

  const respondInvite = useCallback(
    (id: string, accept: boolean): InviteResult => {
      const user = currentUser();
      const note = liveDb().notifs.find((item) => item.id === id);
      if (!user || !note || note.kind !== "invite") return { status: "missing" };
      const workspace = liveDb().workspaces.find((item) => item.id === note.ws);
      commit((draft) => {
        const current = draft.notifs.find((item) => item.id === id);
        if (!current || current.kind !== "invite") return;
        const live = draft.workspaces.find((item) => item.id === current.ws);
        current.status = accept && live ? "accepted" : "declined";
        if (!live) return;
        if (accept && !live.members.includes(user.email)) live.members.push(user.email);
        draft.notifs.push({
          id: uid(),
          kind: "info",
          to: current.from,
          text: `${user.name} ${accept ? "accepted" : "declined"} your invite to ${live.name}`,
          read: false,
          at: Date.now(),
        });
      });
      if (!workspace) return { status: "missing" };
      if (accept) return { status: "joined", workspaceId: workspace.id, name: workspace.name };
      return { status: "declined" };
    },
    [commit, currentUser],
  );

  const removeMember = useCallback(
    (workspaceId: string, email: string) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === workspaceId);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        const live = draft.workspaces.find((item) => item.id === workspaceId);
        if (!live) return;
        live.members = live.members.filter((member) => member !== email);
        draft.notifs.push({
          id: uid(),
          kind: "info",
          to: email,
          text: `You were removed from ${live.name}`,
          read: false,
          at: Date.now(),
        });
      });
    },
    [commit, currentUser],
  );

  const markInfoRead = useCallback(() => {
    const email = liveEmail();
    if (!email) return;
    const unread = liveDb().notifs.some((note) => note.kind === "info" && note.to === email && !note.read);
    if (!unread) return;
    commit((draft) => {
      draft.notifs.forEach((note) => {
        if (note.kind === "info" && note.to === email) note.read = true;
      });
    });
  }, [commit]);

  const value = useMemo<VaultContextValue>(
    () => ({
      ready,
      db,
      me,
      toastMessage,
      toast,
      login,
      signup,
      logout,
      createEnv,
      createProject,
      deleteProject,
      deleteEnv,
      upsertVar,
      removeVar,
      importVars,
      createWorkspace,
      deleteWorkspace,
      invite,
      cancelInvite,
      respondInvite,
      removeMember,
      markInfoRead,
    }),
    [
      ready,
      db,
      me,
      toastMessage,
      toast,
      login,
      signup,
      logout,
      createEnv,
      createProject,
      deleteProject,
      deleteEnv,
      upsertVar,
      removeVar,
      importVars,
      createWorkspace,
      deleteWorkspace,
      invite,
      cancelInvite,
      respondInvite,
      removeMember,
      markInfoRead,
    ],
  );

  return (
    <VaultContext.Provider value={value}>
      {children}
      {toastMessage ? (
        <div
          role="status"
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-max max-w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm text-white shadow-lg dark:bg-ink-100 dark:text-ink-950"
        >
          {toastMessage}
        </div>
      ) : null}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used within Providers");
  return context;
}
