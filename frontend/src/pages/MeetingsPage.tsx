import { CalendarBlank, CaretRight, CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChurnBadge } from "../components/ChurnBadge";
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from "../components/States";
import { listMeetings } from "../lib/api";
import { loadChurnRisks, newestFirst, type ChurnMap } from "../lib/churn";
import { mensagemDeErro } from "../lib/errors";
import { formatDateTime, formatDuration } from "../lib/format";
import { createTransitionClickHandler } from "../lib/viewTransition";
import type { ChurnRiskLevel, Meeting } from "../types/api";

const ICON_CLASS: Record<ChurnRiskLevel, string> = {
  High: "bg-danger-bg text-danger-text",
  Medium: "bg-warning-bg text-warning-text",
  Low: "bg-success-bg text-success-text",
};

function MeetingIcon({ risk }: { risk: ChurnRiskLevel | null | undefined }) {
  const RiskIcon = risk === "Low" ? CheckCircle : risk ? WarningCircle : CalendarBlank;
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${
        risk ? ICON_CLASS[risk] : "bg-hairline/6 text-muted"
      }`}
    >
      <RiskIcon size={20} weight="fill" aria-hidden="true" />
    </span>
  );
}

export function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [churn, setChurn] = useState<ChurnMap>({});
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listMeetings()
      .then((data) => {
        if (cancelled) return;
        const sorted = newestFirst(data);
        setMeetings(sorted);
        return loadChurnRisks(sorted).then((map) => {
          if (!cancelled) setChurn(map);
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(mensagemDeErro(err));
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <>
      <PageHeader
        title="Reuniões"
        description="Todas as reuniões registradas, da mais recente para a mais antiga, com o risco de churn de cada uma."
      />

      {error ? (
        <ErrorState
          title="Não foi possível carregar as reuniões"
          message={error}
          onRetry={() => {
            setError(null);
            setMeetings(null);
            setChurn({});
            setReloadKey((k) => k + 1);
          }}
        />
      ) : meetings === null ? (
        <ListSkeleton />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarBlank}
          title="Nenhuma reunião registrada ainda"
          description="As reuniões criadas em Nova Reunião vão aparecer aqui."
        >
          <Link
            to="/reunioes/nova"
            onClick={createTransitionClickHandler(navigate, "/reunioes/nova")}
            className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition-colors duration-150 hover:bg-accent/90 active:scale-[0.98]"
          >
            Registrar primeira reunião
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {meetings.map((meeting, index) => {
            const duration = formatDuration(meeting.startDateTime, meeting.endDateTime);
            const risk = churn[meeting.id];
            return (
              <li
                key={meeting.id}
                className="animate-fade-up rounded-[13px] border border-hairline/6 bg-card transition-colors duration-150 hover:border-hairline/12"
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
              >
                <Link
                  to={`/reunioes/${meeting.id}`}
                  onClick={createTransitionClickHandler(navigate, `/reunioes/${meeting.id}`)}
                  className="flex items-center gap-4 p-4"
                >
                  <MeetingIcon risk={risk} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-ink">{meeting.title}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                      <span>{formatDateTime(meeting.startDateTime)}</span>
                      {duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} aria-hidden="true" />
                          {duration}
                        </span>
                      )}
                    </span>
                  </div>
                  <ChurnBadge risk={risk} />
                  <CaretRight size={16} aria-hidden="true" className="shrink-0 text-chevron" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
