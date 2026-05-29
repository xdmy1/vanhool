"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

// =============================================================================
// Warm palette tuned to the panel's cream surface — burgundy / brick / amber /
// olive / plum. Gradients flow from a saturated top to a translucent bottom so
// the bars feel sculpted instead of flat.
// =============================================================================

const PALETTE = {
  conta1A: "#8b1f2c",
  conta1B: "#d05a5a",
  conta2A: "#b86c1f",
  conta2B: "#f4b454",
  cashA: "#3f6a3f",
  cashB: "#9ec79c",
  ink: "#1e1b15",
};

const PIE_COLORS = [
  ["#8b1f2c", "#cf4c5a"],
  ["#b86c1f", "#f0a04b"],
  ["#3f6a3f", "#7faa6f"],
  ["#5b4fc4", "#a39ce0"],
  ["#1f6f7c", "#67afba"],
  ["#a13d5e", "#e08aa7"],
  ["#7a5a1a", "#d9ab57"],
  ["#4f6b85", "#a4bbd5"],
];

const ANIM_MS = 850;

// -----------------------------------------------------------------------------
// Formatters
// -----------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("ro-MD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (Math.abs(n) >= 1_000)
    return `${Math.round(n / 1_000)}k`;
  return fmt(n);
};

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
// Polished tooltip — borderless card with a coloured rail per series
// =============================================================================

type TPayload = {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: Record<string, unknown>;
};

function ChartTooltip({
  active,
  payload,
  label,
  unit = "MDL",
  labels,
}: {
  active?: boolean;
  payload?: readonly TPayload[];
  label?: string | number;
  unit?: string;
  labels?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const numericTotal = payload.reduce(
    (s, p) => s + Number(p.value ?? 0),
    0,
  );
  const showTotal = payload.length > 1;
  return (
    <div className="min-w-[180px] overflow-hidden rounded-xl border border-border bg-surface/98 shadow-[0_18px_40px_-18px_rgba(30,27,21,0.35)] backdrop-blur-sm">
      {label != null ? (
        <div className="border-b border-border/70 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          {fmtDay(String(label))}
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5 px-3.5 py-2.5">
        {payload.map((p, i) => {
          const key =
            typeof p.dataKey === "string" || typeof p.dataKey === "number"
              ? String(p.dataKey)
              : "";
          const name = key ? labels?.[key] ?? p.name ?? key : p.name;
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-6 text-xs"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-1 rounded-full"
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
          <div className="mt-1.5 flex items-center justify-between gap-6 border-t border-border/70 pt-2 text-[11px]">
            <span className="font-semibold uppercase tracking-wide text-muted">
              Total
            </span>
            <span className="font-bold tabular-nums text-foreground">
              {fmtFull(numericTotal)} {unit}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// =============================================================================
// Sales bar chart — stacked Conta 1 + Conta 2, dual gradients, soft glow
// =============================================================================

export function SalesBarChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        barCategoryGap="30%"
        margin={{ top: 20, right: 12, left: -6, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gradConta1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.conta1A} stopOpacity={0.95} />
            <stop offset="100%" stopColor={PALETTE.conta1B} stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="gradConta2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.conta2A} stopOpacity={0.95} />
            <stop offset="100%" stopColor={PALETTE.conta2B} stopOpacity={0.55} />
          </linearGradient>
          <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="2 6"
        />
        <XAxis
          dataKey="day"
          tickFormatter={fmtDay}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={fmtCompact}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
          width={42}
        />
        <Tooltip
          cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
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
          maxBarSize={36}
          isAnimationActive
          animationDuration={ANIM_MS}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="conta2"
          stackId="a"
          fill="url(#gradConta2)"
          radius={[10, 10, 0, 0]}
          maxBarSize={36}
          isAnimationActive
          animationDuration={ANIM_MS}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// Cash trend — smooth gradient area + glowing stroke
// =============================================================================

export function CashTrendChart({ data }: { data: CashPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 20, right: 12, left: -6, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.cashA} stopOpacity={0.55} />
            <stop offset="55%" stopColor={PALETTE.cashB} stopOpacity={0.14} />
            <stop offset="100%" stopColor={PALETTE.cashB} stopOpacity={0} />
          </linearGradient>
          <filter id="lineGlow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="2 6"
        />
        <XAxis
          dataKey="day"
          tickFormatter={fmtDay}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={fmtCompact}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
          width={42}
        />
        <Tooltip
          cursor={{
            stroke: PALETTE.cashA,
            strokeOpacity: 0.35,
            strokeWidth: 1.5,
            strokeDasharray: "2 4",
          }}
          content={(p) => (
            <ChartTooltip {...p} labels={{ balance: "Sold cash" }} />
          )}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={PALETTE.cashA}
          strokeWidth={2.5}
          filter="url(#lineGlow)"
          fill="url(#gradCash)"
          isAnimationActive
          animationDuration={ANIM_MS}
          animationEasing="ease-out"
          activeDot={{
            r: 6,
            fill: PALETTE.cashA,
            stroke: "white",
            strokeWidth: 3,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// Category mix — donut with thin inner ring, gradient slices, total in centre
// =============================================================================

export function CategoryMixChart({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <defs>
          {PIE_COLORS.map(([a, b], i) => (
            <linearGradient
              key={`${a}-${b}`}
              id={`gradPie-${i}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={a} stopOpacity={0.95} />
              <stop offset="100%" stopColor={b} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>
        {/* Thin background ring — adds depth */}
        <Pie
          data={[{ name: "_", value: 1 }]}
          dataKey="value"
          innerRadius={56}
          outerRadius={60}
          fill="currentColor"
          fillOpacity={0.06}
          stroke="none"
          isAnimationActive={false}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={64}
          outerRadius={108}
          paddingAngle={2}
          stroke="white"
          strokeWidth={3}
          isAnimationActive
          animationDuration={ANIM_MS}
          animationEasing="ease-out"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={`url(#gradPie-${i % PIE_COLORS.length})`} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="min-w-[140px] overflow-hidden rounded-xl border border-border bg-surface/98 shadow-[0_18px_40px_-18px_rgba(30,27,21,0.35)] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 shrink-0 rounded-full"
                      style={{
                        background:
                          (p.payload as { fill?: string })?.fill ?? p.color,
                      }}
                    />
                    <span className="text-xs text-muted-strong">{p.name}</span>
                  </span>
                  <span className="text-xs font-bold tabular-nums">
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
                fontSize: 10,
                fontWeight: 700,
                opacity: 0.5,
                letterSpacing: "0.16em",
              }}
              dy={-14}
            >
              TOTAL
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "currentColor",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
              dy={6}
            >
              {fmtCompact(total)}
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "currentColor",
                fontSize: 9,
                fontWeight: 600,
                opacity: 0.45,
                letterSpacing: "0.14em",
              }}
              dy={24}
            >
              MDL
            </text>
          </g>
        ) : null}
      </PieChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// KPI sparkline — tiny line chart for the dashboard cards
// =============================================================================

export function Sparkline({
  data,
  color = PALETTE.conta1A,
}: {
  data: { v: number }[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive
          animationDuration={ANIM_MS}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
