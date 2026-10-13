import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-erro`} className="text-xs text-danger-text">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-faint">{hint}</p>
      )}
    </div>
  );
}

/** Banner for API messages (422 business rules, connection errors) or success notes. */
export function FormBanner({ tone = "danger", children }: { tone?: "danger" | "success"; children: ReactNode }) {
  const Icon = tone === "danger" ? WarningCircle : CheckCircle;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-[10px] px-3 py-2 text-sm ${
        tone === "danger" ? "bg-danger-bg text-danger-text" : "bg-success-bg text-success-text"
      }`}
    >
      <Icon size={18} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
