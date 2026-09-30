import type { DB, EnvFile, Role, User, Workspace } from "@/lib/types";

export function inWs(me: User, workspace: Workspace) {
  return me.role === "admin" || workspace.pm === me.email || workspace.members.includes(me.email);
}

export function manages(me: User, workspace: Workspace) {
  return me.role === "admin" || workspace.pm === me.email;
}

export function canCreateIn(me: User, workspace: Workspace) {
  return inWs(me, workspace);
}

export function canView(me: User, env: EnvFile, db: DB) {
  if (!env.ws) return env.owner === me.email;
  const workspace = db.workspaces.find((item) => item.id === env.ws);
  return !!workspace && inWs(me, workspace);
}

export function canEdit(me: User, env: EnvFile, db: DB) {
  if (!env.ws) return env.owner === me.email;
  const workspace = db.workspaces.find((item) => item.id === env.ws);
  return me.role === "admin" || env.owner === me.email || workspace?.pm === me.email;
}

export function myWorkspaces(me: User, db: DB) {
  return db.workspaces.filter((workspace) => inWs(me, workspace));
}

export function homePath(role: Role) {
  return role === "dev" ? "/envs" : "/workspaces";
}

export function tabsFor(role: Role) {
  if (role === "dev") {
    return [
      { href: "/envs", key: "personal", label: "My envs" },
      { href: "/workspaces", key: "workspaces", label: "Workspaces" },
    ];
  }
  if (role === "pm") {
    return [{ href: "/workspaces", key: "workspaces", label: "Workspaces" }];
  }
  return [
    { href: "/workspaces", key: "workspaces", label: "Workspaces" },
    { href: "/users", key: "users", label: "Users" },
  ];
}
