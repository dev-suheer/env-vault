import { uid } from "@/lib/format";
import type { DB, EnvFile, MemberAccess } from "@/lib/types";

export const DB_KEY = "envvault_db2";

export function seed(): DB {
  return {
    users: [
      ["admin@gmail.com", "Admin", "admin"],
      ["pm@gmail.com", "Project Manager", "pm"],
      ["dev1@gmail.com", "Dev One", "dev"],
      ["dev2@gmail.com", "Dev Two", "dev"],
    ].map(([email, name, role]) => ({
      email,
      name,
      role: role as DB["users"][number]["role"],
      password: "demo1234",
      phone: "",
      image: null,
      active: true,
      created: null,
      lastLogin: null,
      lastDevice: null,
      logins: [],
    })),
    workspaces: [],
    projects: [],
    envs: [],
    notifs: [],
    audits: [],
  };
}

function normalize(db: DB) {
  let changed = false;
  if (!Array.isArray(db.projects)) {
    db.projects = [];
    changed = true;
  }
  if (!Array.isArray(db.audits)) {
    db.audits = [];
    changed = true;
  }
  for (const user of db.users) {
    if (typeof user.phone !== "string") {
      user.phone = "";
      changed = true;
    }
    if (user.image !== null && typeof user.image !== "string") {
      user.image = null;
      changed = true;
    }
    if (typeof user.active !== "boolean") {
      user.active = true;
      changed = true;
    }
    if (typeof user.created !== "number") {
      user.created = null;
      changed = true;
    }
    if (typeof user.lastLogin !== "number") {
      user.lastLogin = null;
      changed = true;
    }
    if (typeof user.lastDevice !== "string") {
      user.lastDevice = null;
      changed = true;
    }
    if (!Array.isArray(user.logins)) {
      user.logins = typeof user.lastLogin === "number" ? [user.lastLogin] : [];
      changed = true;
    }
  }
  for (const workspace of db.workspaces) {
    if (!Array.isArray(workspace.editors)) {
      workspace.editors = [];
      changed = true;
    }
  }
  for (const note of db.notifs) {
    if (note.kind !== "invite") continue;
    const access = (note as { access?: MemberAccess }).access;
    if (access === "view" || access === "edit") continue;
    note.access = "view";
    changed = true;
  }
  for (const env of db.envs) {
    const record = env as EnvFile;
    if (record.project) continue;
    if (!record.ws) {
      if (record.project !== null) {
        record.project = null;
        changed = true;
      }
      continue;
    }
    let project = db.projects.find((item) => item.ws === record.ws);
    if (!project) {
      const workspace = db.workspaces.find((item) => item.id === record.ws);
      project = {
        id: uid(),
        ws: record.ws,
        name: "General",
        desc: "",
        owner: workspace?.pm ?? record.owner,
        created: Date.now(),
      };
      db.projects.unshift(project);
    }
    record.project = project.id;
    changed = true;
  }
  return changed;
}

function isDb(value: unknown): value is DB {
  if (!value || typeof value !== "object") return false;
  const db = value as DB;
  return Array.isArray(db.users) && Array.isArray(db.workspaces) && Array.isArray(db.envs) && Array.isArray(db.notifs);
}

export function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const db = seed();
      save(db);
      return db;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isDb(parsed)) {
      const db = seed();
      save(db);
      return db;
    }
    if (normalize(parsed)) save(parsed);
    return parsed;
  } catch {
    return seed();
  }
}

export function save(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
