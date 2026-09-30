export function parseEnv(text: string) {
  const pairs: { k: string; v: string }[] = [];
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;
    let value = match[2].trim();
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    pairs.push({ k: match[1], v: value });
  });
  return pairs;
}

export function toEnv(vars: { k: string; v: string }[]) {
  return vars.map((item) => `${item.k}=${/[\s#"']/.test(item.v) ? JSON.stringify(item.v) : item.v}`).join("\n") + "\n";
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle>;
};

export async function downloadEnv(text: string) {
  const picker = (window as SavePickerWindow).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({
        suggestedName: ".env",
        types: [{ description: "Environment file", accept: { "text/plain": [".env"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(new File([text], ".env", { type: "text/plain;charset=utf-8" }));
      await writable.close();
      return "saved" as const;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled" as const;
    }
  }

  const file = new File([text], ".env", { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = ".env";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1500);
  return "downloaded" as const;
}
