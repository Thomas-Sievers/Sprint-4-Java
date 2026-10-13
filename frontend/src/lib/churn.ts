import type { ChurnRiskLevel, Meeting } from "../types/api";
import { getChurnRisk } from "./api";

export type ChurnMap = Record<number, ChurnRiskLevel | null>;

/** One GET /api/meetings/{id}/churn-risk per meeting, in parallel; a failed call becomes null. */
export async function loadChurnRisks(meetings: Meeting[]): Promise<ChurnMap> {
  const results = await Promise.allSettled(meetings.map((m) => getChurnRisk(m.id)));
  const map: ChurnMap = {};
  meetings.forEach((m, i) => {
    const result = results[i];
    map[m.id] = result.status === "fulfilled" ? result.value.churnRisk : null;
  });
  return map;
}

export function newestFirst(meetings: Meeting[]): Meeting[] {
  return [...meetings].sort((a, b) => b.startDateTime.localeCompare(a.startDateTime));
}
