export type Role = "admin" | "pm" | "dev";

export type MemberAccess = "view" | "edit";

export type EnvKind = "Development" | "Staging" | "Production";

export type User = {
  email: string;
  name: string;
  role: Role;
  password: string;
  phone: string;
  image: string | null;
  active: boolean;
  created: number | null;
  lastLogin: number | null;
  lastDevice: string | null;
  logins: number[];
};

export type Workspace = {
  id: string;
  name: string;
  desc: string;
  pm: string;
  members: string[];
  editors: string[];
  created: number;
};

export type Project = {
  id: string;
  ws: string;
  name: string;
  desc: string;
  owner: string;
  created: number;
};

export type Variable = {
  k: string;
  v: string;
};

export type EnvFile = {
  id: string;
  name: string;
  desc: string;
  env: EnvKind;
  vars: Variable[];
  updated: number;
  owner: string;
  ws: string | null;
  project: string | null;
};

export type InviteNotification = {
  id: string;
  kind: "invite";
  to: string;
  from: string;
  ws: string;
  wsName: string;
  access: MemberAccess;
  status: "pending" | "accepted" | "declined";
  read: boolean;
  at: number;
};

export type InfoNotification = {
  id: string;
  kind: "info";
  to: string;
  text: string;
  read: boolean;
  at: number;
};

export type Notification = InviteNotification | InfoNotification;

export type AuditLog = {
  id: string;
  ws: string;
  at: number;
  by: string;
  action: string;
  subject: string;
  detail: string;
};

export type DB = {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  envs: EnvFile[];
  notifs: Notification[];
  audits: AuditLog[];
};
