import { uid } from "@/lib/format";
import type { DB } from "@/lib/types";

export function writeAudit(draft: DB, input: { ws: string; by: string; action: string; subject: string; detail: string }) {
  if (!Array.isArray(draft.audits)) draft.audits = [];
  draft.audits.unshift({
    id: uid(),
    ws: input.ws,
    at: Date.now(),
    by: input.by,
    action: input.action,
    subject: input.subject,
    detail: input.detail,
  });
}

export function describeChanges(fields: { label: string; from: string; to: string }[]) {
  return fields
    .filter((field) => field.from !== field.to)
    .map((field) => {
      if (!field.from) return `${field.label} set to "${field.to}"`;
      if (!field.to) return `${field.label} cleared (was "${field.from}")`;
      return `${field.label} changed from "${field.from}" to "${field.to}"`;
    })
    .join(". ");
}

export function keyList(keys: string[]) {
  const shown = keys.slice(0, 8);
  const extra = keys.length - shown.length;
  if (!shown.length) return "none";
  return extra > 0 ? `${shown.join(", ")} and ${extra} more` : shown.join(", ");
}
