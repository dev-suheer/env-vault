"use client";

import { useEffect } from "react";

export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} - EnvVault`;
  }, [title]);
}
