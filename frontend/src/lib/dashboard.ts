import type { ChartPoint } from "../components/Charts";
import type { GeneratedAlert, Meeting, TermCategory } from "../types/api";
import type { ChurnMap } from "./churn";
import {
  CHURN_LABELS,
  CHURN_ORDEM,
  CHURN_TONE,
  FAIXA_CONFIANCA_LABELS,
  FAIXA_CONFIANCA_ORDEM,
  FAIXA_CONFIANCA_TONE,
  STATUS_LABELS,
  STATUS_ORDEM,
  STATUS_TONE,
  faixaConfianca,
} from "./labels";

// Everything on the dashboard is computed here from the plain API lists —
// there is no dashboard endpoint in the Sprint 4 API.

const TONE_COLOR = {
  success: "var(--color-success-text)",
  warning: "var(--color-warning-text)",
  danger: "var(--color-danger-text)",
  neutral: "var(--color-muted)",
} as const;

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export function meetingsByChurn(meetings: Meeting[], churn: ChurnMap): ChartPoint[] {
  return CHURN_ORDEM.map((risk) => ({
    key: risk,
    label: CHURN_LABELS[risk],
    value: meetings.filter((m) => churn[m.id] === risk).length,
    color: TONE_COLOR[CHURN_TONE[risk]],
  }));
}

export function alertsByStatus(alerts: GeneratedAlert[]): ChartPoint[] {
  return STATUS_ORDEM.map((status) => ({
    key: status,
    label: STATUS_LABELS[status],
    value: alerts.filter((a) => a.validationStatus === status).length,
    color: TONE_COLOR[STATUS_TONE[status]],
  }));
}

export function alertsByConfidenceBand(alerts: GeneratedAlert[]): ChartPoint[] {
  return FAIXA_CONFIANCA_ORDEM.map((faixa) => ({
    key: faixa,
    label: FAIXA_CONFIANCA_LABELS[faixa],
    value: alerts.filter((a) => faixaConfianca(a.confidenceScore) === faixa).length,
    color: TONE_COLOR[FAIXA_CONFIANCA_TONE[faixa]],
  }));
}

export function averageScore(alerts: GeneratedAlert[]): number {
  if (alerts.length === 0) return 0;
  return alerts.reduce((sum, a) => sum + a.confidenceScore, 0) / alerts.length;
}

/** Alerts of one category grouped by keyword, most mentioned first. */
export function mentionsByKeyword(alerts: GeneratedAlert[], category: TermCategory, limit = 6): ChartPoint[] {
  const groups = new Map<string, { mentions: number; meetings: Set<number> }>();
  alerts
    .filter((a) => a.term.category === category)
    .forEach((a) => {
      const g = groups.get(a.term.keyword) ?? { mentions: 0, meetings: new Set<number>() };
      g.mentions += 1;
      g.meetings.add(a.transcriptLine.meeting.id);
      groups.set(a.term.keyword, g);
    });
  return [...groups.entries()]
    .sort((a, b) => b[1].mentions - a[1].mentions || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([keyword, g]) => ({
      key: keyword,
      label: keyword,
      value: g.mentions,
      detail: `em ${plural(g.meetings.size, "reunião", "reuniões")}`,
    }));
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + ((day === 0 ? -6 : 1) - day)); // Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekLabel(d: Date): string {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
  return `${dia}/${mes}`;
}

/** Meetings per week (Monday start), up to `maxWeeks` ending at the latest meeting, empty weeks included. */
export function meetingsPerWeek(meetings: Meeting[], maxWeeks = 8): ChartPoint[] {
  if (meetings.length === 0) return [];
  const weeks = meetings.map((m) => startOfWeek(new Date(m.startDateTime)).getTime());
  const last = Math.max(...weeks);
  const first = Math.max(Math.min(...weeks), last - (maxWeeks - 1) * 7 * 86400000);

  const points: ChartPoint[] = [];
  for (let t = startOfWeek(new Date(first)); t.getTime() <= last; t.setDate(t.getDate() + 7)) {
    const key = startOfWeek(t).getTime();
    points.push({
      key: String(key),
      label: weekLabel(t),
      value: weeks.filter((w) => w === key).length,
      detail: `Semana de ${weekLabel(t)}`,
    });
  }
  return points;
}

export function competitorMentionsByMeeting(alerts: GeneratedAlert[]): Map<number, number> {
  const map = new Map<number, number>();
  alerts
    .filter((a) => a.term.category === "COMPETITOR")
    .forEach((a) => {
      const id = a.transcriptLine.meeting.id;
      map.set(id, (map.get(id) ?? 0) + 1);
    });
  return map;
}
