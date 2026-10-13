import { CHURN_LABELS, CHURN_TONE } from "../lib/labels";
import type { ChurnRiskLevel } from "../types/api";
import { Badge } from "./Badge";

/** Churn risk badge; `undefined` shows a loading pill, `null` means the request failed. */
export function ChurnBadge({ risk }: { risk: ChurnRiskLevel | null | undefined }) {
  if (risk === undefined) {
    return <span aria-hidden="true" className="h-6 w-24 animate-pulse rounded-full bg-hairline/6" />;
  }
  if (risk === null) {
    return <Badge tone="neutral">Risco indisponível</Badge>;
  }
  return <Badge tone={CHURN_TONE[risk]}>Risco {CHURN_LABELS[risk].toLowerCase()}</Badge>;
}
