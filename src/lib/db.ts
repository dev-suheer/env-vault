import { uid } from "@/lib/format";
import type { DB, EnvFile } from "@/lib/types";

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
    })),
    workspaces: [],
    projects: [],
    envs: [],
    notifs: [],
  };
}

function normalize(db: DB) {
  let changed = false;
  if (!Array.isArray(db.projects)) {
    db.projects = [];
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
