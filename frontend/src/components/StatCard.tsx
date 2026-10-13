import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(eased * target);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}

export function StatCard({
  label,
  value,
  tone = "default",
  delayMs = 0,
  format = (n) => String(Math.round(n)),
}: {
  label: string;
  value: number;
  tone?: "default" | "danger";
  delayMs?: number;
  /** Formats the animated value (integer by default). */
  format?: (value: number) => string;
}) {
  const displayValue = useCountUp(value);

  return (
    <div
      className="animate-fade-up rounded-[13px] border border-hairline/6 bg-card px-5 py-4"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p className={`text-2xl font-extrabold ${tone === "danger" ? "text-danger-text" : "text-ink"}`}>
        {format(displayValue)}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
