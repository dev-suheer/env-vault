"use client";

import { ago, dispName } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { Workspace } from "@/lib/types";

const columns = ["When", "Who", "Action", "What", "Change"] as const;

export function AuditLog({ workspace }: { workspace: Workspace }) {
  const { db } = useVault();
  const entries = (db.audits ?? []).filter((entry) => entry.ws === workspace.id).sort((a, b) => b.at - a.at);

  return (
    <div className={`${card} mt-6 overflow-hidden`}>
      <div className="border-b border-line px-5 py-4 dark:border-ink-700">
        <h2 className="text-sm font-bold">Audit log</h2>
        <p className={`mt-1 text-xs ${mute}`}>Who changed this workspace, what changed, and when. Variable values are not stored here.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas text-xs font-semibold tracking-wide text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400">
              {columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length ? (
              entries.map((entry) => {
                const when = new Date(entry.at);
                const stamp = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(when);
                return (
                  <tr key={entry.id} className="border-b border-[#eaeef2] align-top last:border-0 hover:bg-[#f6f8fa] dark:border-ink-700 dark:hover:bg-ink-800/50">
                    <td className="px-4 py-3 pl-5 whitespace-nowrap">
                      <time dateTime={when.toISOString()} className="block">
                        {stamp}
                      </time>
                      <span className={`mt-0.5 block text-xs ${mute}`}>{ago(entry.at)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="block font-medium">{dispName(db.users, entry.by)}</span>
                      <span className={`mt-0.5 block text-xs ${mute}`}>{entry.by}</span>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{entry.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{entry.subject}</td>
                    <td className={`max-w-md px-4 py-3 pr-5 ${mute}`}>{entry.detail}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className={`px-5 py-8 ${mute}`}>
                  No changes recorded yet. New edits, invites, and env updates will show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
