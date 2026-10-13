import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

// Bar charts with the old dashboard's look: theme tokens for every color,
// recessive grid, rounded data ends, hover tooltip and a direct value label.

export interface ChartPoint {
  key: string;
  label: string;
  value: number;
  /** Per-bar color (status charts); otherwise the chart's `color`. */
  color?: string;
  /** Extra tooltip line. */
  detail?: string;
}

function ChartTooltip({ active, payload, unit }: { active?: boolean; payload?: { payload: ChartPoint }[]; unit: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-[10px] border border-hairline/10 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink">{item.label}</p>
      <p className="text-muted">{unit(item.value)}</p>
      {item.detail && <p className="text-faint">{item.detail}</p>}
    </div>
  );
}

function describe(title: string, data: ChartPoint[]): string {
  return `${title}: ${data.map((d) => `${d.label}, ${d.value}`).join("; ")}`;
}

export function EmptyChart({ children, height = 96 }: { children: string; height?: number }) {
  return (
    <p
      style={{ height }}
      className="flex items-center justify-center rounded-[13px] border border-dashed border-hairline/10 text-center text-sm text-faint"
    >
      {children}
    </p>
  );
}

/** Horizontal bars: categories on the Y axis, good for names and statuses. */
export function HBarChart({
  title,
  data,
  unit,
  color = "var(--color-accent-text)",
  labelWidth = 90,
}: {
  title: string;
  data: ChartPoint[];
  unit: (n: number) => string;
  color?: string;
  labelWidth?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <div role="img" aria-label={describe(title, data)} style={{ height: data.length * 40 + 16 }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--color-hairline)" strokeOpacity={0.08} />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--color-faint)"
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={labelWidth}
          />
          <Tooltip
            cursor={{ fill: "var(--color-hairline)", opacity: 0.06 }}
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload as unknown as { payload: ChartPoint }[]} unit={unit} />
            )}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
            isAnimationActive={!reducedMotion}
            animationDuration={300}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color ?? color} />
            ))}
            <LabelList dataKey="value" position="right" fill="var(--color-muted)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Vertical bars: ordered categories on the X axis (weeks, bands). */
export function VBarChart({
  title,
  data,
  unit,
  color = "var(--color-accent-text)",
  height = 192,
}: {
  title: string;
  data: ChartPoint[];
  unit: (n: number) => string;
  color?: string;
  height?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <div role="img" aria-label={describe(title, data)} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 16, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-hairline)" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--color-faint)"
            tick={{ fill: "var(--color-faint)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--color-faint)"
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            cursor={{ fill: "var(--color-hairline)", opacity: 0.06 }}
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload as unknown as { payload: ChartPoint }[]} unit={unit} />
            )}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            isAnimationActive={!reducedMotion}
            animationDuration={300}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color ?? color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
