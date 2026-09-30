"use client";

import { initOf, dispName } from "@/lib/format";
import { useVault } from "@/lib/store";

export function Avatar({ email, className = "h-9 w-9 text-sm" }: { email: string; className?: string }) {
  const { db } = useVault();
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white ${className}`}>
      {initOf(dispName(db.users, email))}
    </span>
  );
}
