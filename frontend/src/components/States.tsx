import { WarningCircle, type Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[13px] border border-hairline/6 bg-danger/8 py-16 text-center">
      <WarningCircle size={32} aria-hidden="true" className="text-danger-text" />
      <div>
        <p className="text-sm font-medium text-danger-text">{title}</p>
        <p className="mt-1 text-sm text-danger-text/70">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-[10px] border border-danger/30 px-3 py-1.5 text-sm font-medium text-danger-text transition-colors duration-150 hover:bg-danger/10 active:scale-[0.98]"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  children,
}: {
  icon: Icon;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[13px] border border-dashed border-hairline/10 bg-card py-16 text-center">
      <IconComponent size={32} aria-hidden="true" className="text-dim" />
      <div>
        <p className="text-sm font-medium text-muted">{title}</p>
        {description && <p className="mt-1 text-sm text-faint">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center justify-between rounded-[13px] border border-hairline/6 bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-[10px] bg-hairline/6" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-40 animate-pulse rounded bg-hairline/6" />
              <div className="h-3 w-24 animate-pulse rounded bg-hairline/6" />
            </div>
          </div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-hairline/6" />
        </li>
      ))}
    </ul>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
