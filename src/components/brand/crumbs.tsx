import Link from "next/link";

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <svg className="h-3.5 w-3.5 shrink-0 text-[#8c959f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            ) : null}
            {item.href && !last ? (
              <Link
                href={item.href}
                className="truncate rounded-md px-1.5 py-1 font-medium text-mute hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
              >
                {item.label}
              </Link>
            ) : (
              <span className="truncate px-1.5 py-1 font-semibold text-fg dark:text-ink-100">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
