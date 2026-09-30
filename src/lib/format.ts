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

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
