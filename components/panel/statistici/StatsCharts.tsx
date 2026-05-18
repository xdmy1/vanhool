"use client";

import {
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

const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

export function SalesBarChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="conta1" stackId="a" fill="#3b82f6" name="Conta 1" />
        <Bar dataKey="conta2" stackId="a" fill="#f59e0b" name="Conta 2" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CashTrendChart({ data }: { data: CashPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Sold cash"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryMixChart({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
