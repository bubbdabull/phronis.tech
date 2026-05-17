"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tickMuted = { fill: "rgba(200, 210, 220, 0.55)", fontSize: 10 };

function deskTooltipStyle() {
  return {
    backgroundColor: "rgba(8, 10, 14, 0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    fontSize: 12,
    color: "rgba(245, 248, 252, 0.95)",
  };
}

export type TrendingChartRow = { symbol: string; change24hPct: number; volumeH24: number };

/** 24h % change across boosted trending picks (read-only sentiment strip). */
export function DeskTrendingChangeChart({ rows }: { rows: TrendingChartRow[] }) {
  const gradId = useId().replace(/:/g, "");
  if (!rows.length) return null;
  const data = rows.map((r) => ({ name: r.symbol.slice(0, 8), change: r.change24hPct }));
  const fillUrl = `url(#${gradId})`;
  return (
    <div className="h-36 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(45, 212, 191)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(45, 212, 191)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={tickMuted} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={tickMuted} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={deskTooltipStyle()}
            formatter={(v) => {
              const n = Number(v);
              return [`${n >= 0 ? "+" : ""}${n.toFixed(2)}%`, "24h"];
            }}
            labelFormatter={(l) => String(l)}
          />
          <Area type="monotone" dataKey="change" stroke="rgb(45, 212, 191)" strokeWidth={2} fill={fillUrl} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Log-scale friendly bar chart: 24h USD volume by symbol. */
export function DeskTrendingVolumeChart({ rows }: { rows: TrendingChartRow[] }) {
  if (!rows.length) return null;
  const maxV = Math.max(...rows.map((r) => r.volumeH24), 1);
  const data = rows.map((r) => ({
    name: r.symbol.slice(0, 10),
    vol: r.volumeH24,
    fill: r.change24hPct >= 0 ? "rgba(45, 212, 191, 0.85)" : "rgba(251, 113, 133, 0.75)",
  }));
  return (
    <div className="h-40 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={tickMuted} axisLine={false} tickLine={false} interval={0} />
          <YAxis
            tick={tickMuted}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, maxV * 1.08]}
            tickFormatter={(v) => {
              if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
              if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
              if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
              return `$${Math.round(v)}`;
            }}
          />
          <Tooltip
            contentStyle={deskTooltipStyle()}
            formatter={(v) => [`$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Volume 24h"]}
          />
          <Bar dataKey="vol" radius={[5, 5, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={`${entry.name}-${i}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
