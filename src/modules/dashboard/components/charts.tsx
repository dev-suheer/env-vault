"use client";

import { useId } from "react";
import { mute } from "@/lib/styles";
import type { DayPoint, Slice } from "@/modules/dashboard/lib/stats";

export function ActivityChart({ days }: { days: DayPoint[] }) {
  const max = Math.max(1, ...days.map((day) => day.value));
  return (
    <div>
      <div className="flex h-40 items-end gap-1.5 sm:gap-2">
        {days.map((day) => (
          <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${day.title}: ${day.value}`}>
            <span className={`mb-1 text-center text-[10px] font-semibold ${day.value ? "" : mute}`}>{day.value}</span>
            <div className="rounded-t bg-brand-500" style={{ height: `${Math.max((day.value / max) * 100, day.value ? 8 : 2)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {days.map((day) => (
          <span key={day.key} className={`min-w-0 flex-1 truncate text-center text-[10px] ${mute}`}>
            {day.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function curve(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    const c1x = current.x + (next.x - previous.x) / 6;
    const c1y = current.y + (next.y - previous.y) / 6;
    const c2x = next.x - (after.x - current.x) / 6;
    const c2y = next.y - (after.y - current.y) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function LoginLineChart({ days }: { days: DayPoint[] }) {
  const rawId = useId().replace(/:/g, "");
  const strokeId = `login-stroke-${rawId}`;
  const fillId = `login-fill-${rawId}`;
  const width = 720;
  const height = 210;
  const pad = { l: 40, r: 40, t: 48, b: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const peak = Math.max(0, ...days.map((day) => day.value));
  const axisMax = Math.max(4, Math.ceil(peak / 4) * 4);
  const x = (index: number) => pad.l + (days.length <= 1 ? innerW / 2 : (index / (days.length - 1)) * innerW);
  const y = (value: number) => pad.t + innerH - (value / axisMax) * innerH;
  const points = days.map((day, index) => ({ x: x(index), y: y(day.value) }));
  const line = curve(points);
  const area = points.length ? `${line} L ${points[points.length - 1].x} ${y(0)} L ${points[0].x} ${y(0)} Z` : "";
  const steps = 4;
  let high = 0;
  let low = 0;
  days.forEach((day, index) => {
    if (day.value > days[high].value) high = index;
    if (day.value < days[low].value) low = index;
  });
  const markers = peak === 0 ? [] : high === low || days[low].value === 0 ? [high] : [high, low];
  const labelEvery = days.length > 12 ? 5 : 1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full font-sans" style={{ aspectRatio: `${width} / ${height}` }} role="img" aria-label="Login activity">
      <defs>
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="45%" stopColor="#0f9d75" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f9d75" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: steps + 1 }, (_, index) => {
        const value = Math.round((axisMax / steps) * index);
        const yPos = y(value);
        return (
          <g key={value}>
            <line x1={pad.l} x2={width - pad.r} y1={yPos} y2={yPos} className="stroke-[#e6ebf1] dark:stroke-ink-700" strokeWidth="1" />
            <text x={pad.l - 10} y={yPos + 4} textAnchor="end" className="fill-[#8c959f] dark:fill-ink-400" fontSize="11">
              {value}
            </text>
            <text x={width - pad.r + 10} y={yPos + 4} textAnchor="start" className="fill-[#8c959f] dark:fill-ink-400" fontSize="11">
              {value}
            </text>
          </g>
        );
      })}
      {area ? <path d={area} fill={`url(#${fillId})`} /> : null}
      {line ? (
        <path d={line} fill="none" stroke={`url(#${strokeId})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      ) : null}
      {line ? <path d={line} fill="none" stroke={`url(#${strokeId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {markers.map((index) => {
        const point = points[index];
        const label = String(days[index].value);
        const boxW = Math.max(36, label.length * 10 + 18);
        const boxH = 24;
        const above = point.y < height * 0.34 || point.y + 42 > height - 24;
        const boxY = above ? point.y - 36 : point.y + 14;
        const boxX = Math.min(width - boxW - 6, Math.max(6, point.x - boxW / 2));
        return (
          <g key={days[index].key}>
            <title>{`${days[index].title}: ${days[index].value}`}</title>
            <line x1={point.x} x2={point.x} y1={above ? point.y - 6 : point.y + 6} y2={above ? boxY + boxH : boxY} stroke="#0f9d75" strokeWidth="1.5" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={12} fill="#0f9d75" />
            <text x={boxX + boxW / 2} y={boxY + 16} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
              {label}
            </text>
          </g>
        );
      })}
      {days.map((day, index) =>
        index % labelEvery === 0 || index === days.length - 1 ? (
          <text key={day.key} x={x(index)} y={height - 12} textAnchor="middle" className="fill-[#8c959f] dark:fill-ink-400" fontSize="11">
            {day.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function DonutChart({ slices, center }: { slices: Slice[]; center: string }) {
  const total = slices.reduce((count, slice) => count + slice.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={center}>
          <circle cx="60" cy="60" r={radius} fill="none" className="stroke-line dark:stroke-ink-700" strokeWidth="14" />
          {total
            ? slices.map((slice) => {
                const length = (slice.value / total) * circumference;
                const dash = `${length} ${circumference - length}`;
                const offset = -cursor;
                cursor += length;
                if (!slice.value) return null;
                return (
                  <circle
                    key={slice.label}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="14"
                    strokeDasharray={dash}
                    strokeDashoffset={offset}
                    transform="rotate(-90 60 60)"
                  />
                );
              })
            : null}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-extrabold">{total}</p>
            <p className={`text-[10px] ${mute}`}>total</p>
          </div>
        </div>
      </div>
      <ul className="min-w-40 flex-1 space-y-2">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.color }} />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="font-semibold">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
