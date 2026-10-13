import type { BadgeTone } from "../components/Badge";
import type { ChurnRiskLevel, ParticipationType, TermCategory, ValidationStatus } from "../types/api";

// The API sends the enums in English; the interface shows them in Portuguese.

export const STATUS_LABELS: Record<ValidationStatus, string> = {
  PENDING: "Pendente",
  VALIDATED: "Validado",
  CORRECTED: "Corrigido",
};

export const STATUS_TONE: Record<ValidationStatus, BadgeTone> = {
  PENDING: "warning",
  VALIDATED: "success",
  CORRECTED: "neutral",
};

export const STATUS_ORDEM: ValidationStatus[] = ["VALIDATED", "PENDING", "CORRECTED"];

export const CATEGORIA_LABELS: Record<TermCategory, string> = {
  COMPETITOR: "Concorrente",
  OWN_PRODUCT: "Produto TOTVS",
  TECHNOLOGY: "Tecnologia",
};

export const CATEGORIA_ORDEM: TermCategory[] = ["COMPETITOR", "OWN_PRODUCT", "TECHNOLOGY"];

export const PAPEL_LABELS: Record<ParticipationType, string> = {
  ORGANIZER: "Organizador",
  PRESENTER: "Apresentador",
  LISTENER: "Ouvinte",
};

export const PAPEL_ORDEM: ParticipationType[] = ["ORGANIZER", "PRESENTER", "LISTENER"];

export const CHURN_LABELS: Record<ChurnRiskLevel, string> = {
  Low: "Baixo",
  Medium: "Médio",
  High: "Alto",
};

export const CHURN_TONE: Record<ChurnRiskLevel, BadgeTone> = {
  Low: "success",
  Medium: "warning",
  High: "danger",
};

export const CHURN_ORDEM: ChurnRiskLevel[] = ["High", "Medium", "Low"];

// Confidence bands: baixa <70, media 70-84, alta 85+.
export type FaixaConfianca = "baixa" | "media" | "alta";

export function faixaConfianca(score: number): FaixaConfianca {
  if (score < 70) return "baixa";
  if (score < 85) return "media";
  return "alta";
}

export const FAIXA_CONFIANCA_LABELS: Record<FaixaConfianca, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const FAIXA_CONFIANCA_TONE: Record<FaixaConfianca, BadgeTone> = {
  baixa: "danger",
  media: "warning",
  alta: "success",
};

export const FAIXA_CONFIANCA_ORDEM: FaixaConfianca[] = ["baixa", "media", "alta"];
