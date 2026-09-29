import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Daily clicks line; expects [{ date: "2026-09-01", count: 3 }, ...]
export default function ClicksChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  const total = data.reduce((acc, cur) => acc + (cur.count || 0), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-base font-extrabold text-brand-600">
            {payload[0].value.toLocaleString("en-IN")}{" "}
            <span className="text-xs font-medium text-slate-600">clicks</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
              <stop offset="60%" stopColor="#6366f1" stopOpacity={0.10} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            minTickGap={25}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
            fill="url(#clicksFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
