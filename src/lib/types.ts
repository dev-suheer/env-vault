export type Role = "admin" | "pm" | "dev";

export type EnvKind = "Development" | "Staging" | "Production";

export type User = {
  email: string;
  name: string;
  role: Role;
  password: string;
};

export type Workspace = {
  id: string;
  name: string;
  desc: string;
  pm: string;
  members: string[];
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

export type DB = {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  envs: EnvFile[];
  notifs: Notification[];
};
