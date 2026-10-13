import { Badge } from "./Badge";
import { FAIXA_CONFIANCA_LABELS, FAIXA_CONFIANCA_TONE, faixaConfianca } from "../lib/labels";
import { formatScore } from "../lib/format";

const BAR_CLASS = {
  alta: "bg-success-text",
  media: "bg-warning-text",
  baixa: "bg-danger-text",
} as const;

export function ScoreConfianca({ score }: { score: number }) {
  const faixa = faixaConfianca(score);
  const percentual = Math.max(0, Math.min(100, score));
  return (
    <div className="flex items-center gap-2" title="Score de confiança">
      <span className="text-xs font-semibold text-ink">{formatScore(score)}</span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-hairline/10">
        <div className={`h-full rounded-full ${BAR_CLASS[faixa]}`} style={{ width: `${percentual}%` }} />
      </div>
      <Badge tone={FAIXA_CONFIANCA_TONE[faixa]}>{FAIXA_CONFIANCA_LABELS[faixa]}</Badge>
    </div>
  );
}
