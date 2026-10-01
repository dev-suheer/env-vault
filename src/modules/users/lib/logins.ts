import type { DayPoint } from "@/modules/dashboard/lib/stats";

export type LoginRange = "Week" | "Month" | "Year";

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function countBetween(logins: number[] | undefined, from: number, to: number) {
  return (logins ?? []).filter((at) => at >= from && at < to).length;
}

export function loginPoints(logins: number[] | undefined, range: LoginRange): DayPoint[] {
  const today = startOfDay(new Date());
  if (range === "Year") {
    return Array.from({ length: 12 }, (_, index) => {
      const month = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
      const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      return {
        key: String(month.getTime()),
        label: month.toLocaleDateString(undefined, { month: "short" }),
        title: month.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
        value: countBetween(logins, month.getTime(), next.getTime()),
      };
    });
  }

  const count = range === "Week" ? 7 : 30;
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (count - 1 - index));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return {
      key: String(day.getTime()),
      label: day.toLocaleDateString(undefined, range === "Week" ? { weekday: "short" } : { month: "short", day: "numeric" }),
      title: day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
      value: countBetween(logins, day.getTime(), next.getTime()),
    };
  });
}

export function busiestLogin(days: DayPoint[]) {
  let best: { title: string; count: number } | null = null;
  for (const day of days) {
    if (!best || day.value > best.count) best = { title: day.title, count: day.value };
  }
  if (!best || best.count === 0) return null;
  return best;
}
