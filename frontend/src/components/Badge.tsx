import type { ReactNode } from "react";

export type BadgeTone = "danger" | "warning" | "success" | "neutral";

const TONE_STYLES: Record<BadgeTone, string> = {
  danger: "bg-danger-bg text-danger-text",
  warning: "bg-warning-bg text-warning-text",
  success: "bg-success-bg text-success-text",
  neutral: "bg-hairline/6 text-muted",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
