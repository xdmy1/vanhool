"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesPoint = { day: string; conta1: number; conta2: number };
type CashPoint = { day: string; balance: number };
type Slice = { name: string; value: number };

const PALETTE = {
  conta1: "#6366f1",
  conta1Light: "#a5b4fc",
  conta2: "#f59e0b",
  conta2Light: "#fcd34d",
  cash: "#10b981",
  cashLight: "#6ee7b7",
};

const PIE_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
  "#ec4899", // pink
];

const fmt = (n: number) =>
  new Intl.NumberFormat("ro-MD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat("ro-MD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const fmtDay = (raw: string) => {
  if (!raw || raw.length < 10) return raw;
  const [, m, d] = raw.split("-");
  return `${d}.${m}`;
};

// =============================================================================
// Custom tooltip — polished card matching the panel surface
// =============================================================================

type TooltipPayload = {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  // recharts also allows function accessors here.
  dataKey?: string | number | ((obj: unknown) => unknown);
};

function ChartTooltip({
  active,
  payload,
  label,
  unit = "MDL",
  labels,
}: {
  active?: boolean;
  payload?: readonly TooltipPayload[];
  label?: string | number;
  unit?: string;
  labels?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + Number(p.value ?? 0), 0);
  const showTotal = payload.length > 1;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface/95 shadow-lg backdrop-blur">
      <div className="border-b border-border bg-surface-elevated/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label != null ? fmtDay(String(label)) : ""}
      </div>
      <div className="flex flex-col gap-1 px-3 py-2">
        {payload.map((p, i) => {
          const key =
            typeof p.dataKey === "string" || typeof p.dataKey === "number"
              ? String(p.dataKey)
              : "";
          const name = key ? labels?.[key] ?? p.name ?? key : p.name;
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block size-2 shrink-0 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="text-muted-strong">{name}</span>
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {fmtFull(Number(p.value ?? 0))}
              </span>
            </div>
          );
        })}
        {showTotal ? (
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-1.5 text-xs">
            <span className="text-muted">Total</span>
            <span className="font-bold tabular-nums">
              {fmtFull(total)} {unit}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// =============================================================================
// Sales bar chart — stacked Conta 1 + Conta 2 with gradient + rounded tops
// =============================================================================

export function SalesBarChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barCategoryGap="22%" margin={{ top: 12, right: 6, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradConta1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.conta1} stopOpacity={0.95} />
            <stop offset="100%" stopColor={PALETTE.conta1Light} stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="gradConta2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.conta2} stopOpacity={0.95} />
            <stop offset="100%" stopColor={PALETTE.conta2Light} stopOpacity={0.65} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="day"
          tickFormatter={fmtDay}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "currentColor", opacity: 0.55 }}
        />
        <YAxis
          tickFormatter={fmt}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "currentColor", opacity: 0.55 }}
          width={42}
        />
        <Tooltip
          cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
          content={(p) => (
            <ChartTooltip
              {...p}
              labels={{ conta1: "Conta 1", conta2: "Conta 2" }}
            />
          )}
        />
        <Bar
          dataKey="conta1"
          stackId="a"
          fill="url(#gradConta1)"
          radius={[0, 0, 0, 0]}
          maxBarSize={48}
        />
        <Bar
          dataKey="conta2"
          stackId="a"
          fill="url(#gradConta2)"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// Cash trend — smooth gradient area
// =============================================================================

export function CashTrendChart({ data }: { data: CashPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 12, right: 6, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.cash} stopOpacity={0.45} />
            <stop offset="60%" stopColor={PALETTE.cashLight} stopOpacity={0.12} />
            <stop offset="100%" stopColor={PALETTE.cashLight} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="day"
          tickFormatter={fmtDay}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "currentColor", opacity: 0.55 }}
        />
        <YAxis
          tickFormatter={fmt}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "currentColor", opacity: 0.55 }}
          width={42}
        />
        <Tooltip
          cursor={{ stroke: PALETTE.cash, strokeOpacity: 0.4, strokeWidth: 1 }}
          content={(p) => (
            <ChartTooltip {...p} labels={{ balance: "Sold cash" }} />
          )}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={PALETTE.cash}
          strokeWidth={2.5}
          fill="url(#gradCash)"
          activeDot={{ r: 5, fill: PALETTE.cash, stroke: "white", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// Category mix — donut with total in the centre
// =============================================================================

export function CategoryMixChart({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <defs>
          {PIE_COLORS.map((c, i) => (
            <linearGradient
              key={c}
              id={`gradPie-${i}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={c} stopOpacity={0.9} />
              <stop offset="100%" stopColor={c} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={102}
          paddingAngle={2}
          stroke="white"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={`url(#gradPie-${i % PIE_COLORS.length})`}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="overflow-hidden rounded-lg border border-border bg-surface/95 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2 px-3 py-2">
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ background: (p.payload as { fill?: string })?.fill ?? p.color }}
                  />
                  <span className="text-xs text-muted-strong">{p.name}</span>
                  <span className="ml-2 text-xs font-bold tabular-nums">
                    {fmtFull(Number(p.value ?? 0))}
                  </span>
                </div>
              </div>
            );
          }}
        />
        {total > 0 ? (
          <g pointerEvents="none">
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "currentColor",
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.55,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
              dy={-10}
            >
              Total
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "currentColor",
                fontSize: 18,
                fontWeight: 800,
              }}
              dy={10}
            >
              {fmt(total)}
            </text>
          </g>
        ) : null}
      </PieChart>
    </ResponsiveContainer>
  );
}
