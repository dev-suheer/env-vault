export function myNotifs<T extends { to: string; at: number }>(notes: T[], email: string) {
  return notes.filter((note) => note.to === email).sort((a, b) => b.at - a.at);
}

export function bellCount(
  notes: { to: string; kind: string; status?: string; read: boolean }[],
  email: string,
) {
  return notes.filter((note) => note.to === email && (note.kind === "invite" ? note.status === "pending" : !note.read)).length;
}
