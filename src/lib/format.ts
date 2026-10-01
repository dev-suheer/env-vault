export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ago(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
}

export function nameOf(email: string) {
  return (email.split("@")[0] || "User")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initOf(name: string) {
  return (name.match(/\b\w/g) || ["U"]).slice(0, 2).join("").toUpperCase();
}

export function dispName(users: { email: string; name: string }[], email: string) {
  return users.find((user) => user.email === email)?.name || nameOf(email);
}

export function deviceLabel(agent: string) {
  if (!agent) return "Unknown device";
  const browser = /Edg\//.test(agent) ? "Edge" : /Chrome\//.test(agent) ? "Chrome" : /Firefox\//.test(agent) ? "Firefox" : /Safari\//.test(agent) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(agent) ? "iOS" : /Android/.test(agent) ? "Android" : /Mac OS X/.test(agent) ? "macOS" : /Windows/.test(agent) ? "Windows" : /Linux/.test(agent) ? "Linux" : "Unknown OS";
  return `${browser} on ${os}`;
}

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
