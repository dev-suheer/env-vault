export function DemoAccounts({ onPick }: { onPick: (email: string) => void }) {
  const accounts = ["admin@gmail.com", "pm@gmail.com", "dev1@gmail.com", "dev2@gmail.com"];
  return (
    <div className="mt-6 rounded-lg border border-line bg-canvas p-3 text-xs text-mute dark:border-ink-700 dark:bg-ink-950/60 dark:text-ink-400">
      <p>
        Demo accounts (password <span className="font-mono">demo1234</span>). Click to fill.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {accounts.map((email) => (
          <button
            key={email}
            type="button"
            onClick={() => onPick(email)}
            className="rounded-md border border-line bg-white px-2 py-1 font-mono hover:border-brand-500 dark:border-ink-650 dark:bg-ink-900"
          >
            {email}
          </button>
        ))}
      </div>
    </div>
  );
}
