"use client";

import { initOf, dispName } from "@/lib/format";
import { useVault } from "@/lib/store";

export function UserPhoto({ name, image, className }: { name: string; image?: string | null; className: string }) {
  if (image) {
    return <span aria-hidden className={`inline-block shrink-0 rounded-full bg-cover bg-center ${className}`} style={{ backgroundImage: `url("${image}")` }} />;
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white ${className}`}>
      {initOf(name)}
    </span>
  );
}

export function Avatar({ email, className = "h-9 w-9 text-sm" }: { email: string; className?: string }) {
  const { db } = useVault();
  const user = db.users.find((item) => item.email === email);
  return <UserPhoto name={user?.name || dispName(db.users, email)} image={user?.image} className={className} />;
}
