import { CaretLeft, ChatCircleDots, Clock, Scroll, Users, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCard } from "../components/AlertCard";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { ChurnBadge } from "../components/ChurnBadge";
import { StatCard } from "../components/StatCard";
import { EmptyState, ErrorState } from "../components/States";
import { TermTag } from "../components/TermTag";
import {
  ApiError,
  getChurnRisk,
  getMeeting,
  getMeetingSummary,
  listMeetingAlerts,
  listMeetingParticipants,
  listMeetingTranscriptLines,
} from "../lib/api";
import { mensagemDeErro } from "../lib/errors";
import { formatDate, formatDuration, formatScore, formatTime } from "../lib/format";
import { CATEGORIA_LABELS, CATEGORIA_ORDEM, PAPEL_LABELS, PAPEL_ORDEM } from "../lib/labels";
import { createTransitionClickHandler } from "../lib/viewTransition";
import type {
  ChurnRiskLevel,
  GeneratedAlert,
  Meeting,
  MeetingParticipant,
  MeetingSummary,
  TranscriptLine,
} from "../types/api";

interface Detalhe {
  meeting: Meeting;
  participants: MeetingParticipant[];
  lines: TranscriptLine[];
  alerts: GeneratedAlert[];
  summary: MeetingSummary;
  churnRisk: ChurnRiskLevel;
}

type Estado = "carregando" | "ok" | "erro" | "nao-encontrada";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Users; children: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
      <Icon size={16} aria-hidden="true" className="text-dim" />
      {children}
    </h2>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-64 animate-pulse rounded bg-hairline/6" />
        <div className="h-4 w-40 animate-pulse rounded bg-hairline/6" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[84px] animate-pulse rounded-[13px] border border-hairline/6 bg-card" />
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-[13px] border border-hairline/6 bg-card p-4">
            <div className="h-3 w-32 animate-pulse rounded bg-hairline/6" />
            <div className="h-4 w-full animate-pulse rounded bg-hairline/6" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-hairline/6" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NaoEncontrada() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={WarningCircle}
      title="Reunião não encontrada"
      description="Ela pode ter sido removida ou o link está incorreto."
    >
      <Link
        to="/reunioes"
        onClick={createTransitionClickHandler(navigate, "/reunioes")}
        className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition-colors duration-150 hover:bg-accent/90 active:scale-[0.98]"
      >
        Voltar para Reuniões
      </Link>
    </EmptyState>
  );
}

export function MeetingDetailPage() {
  const { reuniaoId } = useParams<{ reuniaoId: string }>();
  const navigate = useNavigate();
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);
  const [estado, setEstado] = useState<Estado>("carregando");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const id = Number(reuniaoId);
  const idValido = Number.isInteger(id) && id > 0;

  useEffect(() => {
    if (!idValido) return;
    let cancelled = false;

    Promise.all([
      getMeeting(id),
      listMeetingParticipants(id),
      listMeetingTranscriptLines(id),
      listMeetingAlerts(id),
      getMeetingSummary(id),
      getChurnRisk(id),
    ])
      .then(([meeting, participants, lines, alerts, summary, churn]) => {
        if (cancelled) return;
        setDetalhe({ meeting, participants, lines, alerts, summary, churnRisk: churn.churnRisk });
        setEstado("ok");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setEstado("nao-encontrada");
          return;
        }
        setError(mensagemDeErro(err));
        setEstado("erro");
      });

    return () => {
      cancelled = true;
    };
  }, [id, idValido, reloadKey]);

  const participantesOrdenados = useMemo(
    () =>
      detalhe
        ? [...detalhe.participants].sort(
            (a, b) =>
              PAPEL_ORDEM.indexOf(a.participationType) - PAPEL_ORDEM.indexOf(b.participationType) ||
              a.participant.name.localeCompare(b.participant.name),
          )
        : [],
    [detalhe],
  );

  const falasOrdenadas = useMemo(
    () => (detalhe ? [...detalhe.lines].sort((a, b) => a.spokenAt.localeCompare(b.spokenAt)) : []),
    [detalhe],
  );

  // Alerts grouped by transcript line, to highlight the lines that raised them.
  const alertasPorFala = useMemo(() => {
    const map = new Map<number, GeneratedAlert[]>();
    detalhe?.alerts.forEach((a) => {
      const list = map.get(a.transcriptLine.id) ?? [];
      list.push(a);
      map.set(a.transcriptLine.id, list);
    });
    return map;
  }, [detalhe]);

  // Pending first, then by time.
  const alertasOrdenados = useMemo(
    () =>
      detalhe
        ? [...detalhe.alerts].sort(
            (a, b) =>
              Number(b.validationStatus === "PENDING") - Number(a.validationStatus === "PENDING") ||
              a.transcriptLine.spokenAt.localeCompare(b.transcriptLine.spokenAt),
          )
        : [],
    [detalhe],
  );

  function handleValidated(updated: GeneratedAlert) {
    setDetalhe((d) =>
      d ? { ...d, alerts: d.alerts.map((a) => (a.id === updated.id ? updated : a)) } : d,
    );
  }

  return (
    <>
      <Link
        to="/reunioes"
        onClick={createTransitionClickHandler(navigate, "/reunioes")}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
      >
        <CaretLeft size={14} aria-hidden="true" />
        Reuniões
      </Link>

      {!idValido ? (
        <NaoEncontrada />
      ) : estado === "carregando" ? (
        <DetailSkeleton />
      ) : estado === "erro" ? (
        <ErrorState
          title="Não foi possível carregar a reunião"
          message={error ?? ""}
          onRetry={() => {
            setError(null);
            setEstado("carregando");
            setReloadKey((k) => k + 1);
          }}
        />
      ) : estado === "nao-encontrada" ? (
        <NaoEncontrada />
      ) : detalhe ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-ink">{detalhe.meeting.title}</h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span>{formatDate(detalhe.meeting.startDateTime)}</span>
                <span>
                  {formatTime(detalhe.meeting.startDateTime)}
                  {detalhe.meeting.endDateTime && ` – ${formatTime(detalhe.meeting.endDateTime)}`}
                </span>
                {formatDuration(detalhe.meeting.startDateTime, detalhe.meeting.endDateTime) && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} aria-hidden="true" />
                    {formatDuration(detalhe.meeting.startDateTime, detalhe.meeting.endDateTime)}
                  </span>
                )}
              </p>
            </div>
            <ChurnBadge risk={detalhe.churnRisk} />
          </div>

          <section aria-label="Resumo da reunião" className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="Falas transcritas" value={detalhe.summary.totalTranscriptLines} />
              <StatCard label="Alertas gerados" value={detalhe.summary.totalAlerts} delayMs={40} />
              <StatCard
                label="Score médio de confiança"
                value={detalhe.summary.averageConfidenceScore}
                format={formatScore}
                delayMs={80}
              />
            </div>
            <div className="animate-fade-up rounded-[13px] border border-hairline/6 bg-card px-5 py-4">
              <p className="text-sm text-muted">Termos mencionados por categoria</p>
              {Object.keys(detalhe.summary.termsByCategory).length === 0 ? (
                <p className="mt-2 text-sm text-faint">Nenhum termo do dicionário foi mencionado.</p>
              ) : (
                <dl className="mt-3 flex flex-col gap-2">
                  {CATEGORIA_ORDEM.filter((c) => detalhe.summary.termsByCategory[c]?.length).map((categoria) => (
                    <div key={categoria} className="flex flex-wrap items-center gap-2">
                      <dt className="w-28 text-xs font-semibold uppercase tracking-wide text-faint">
                        {CATEGORIA_LABELS[categoria]}
                      </dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {detalhe.summary.termsByCategory[categoria]!.map((kw) => (
                          <TermTag key={kw} keyword={kw} category={categoria} />
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>

          <section>
            <SectionTitle icon={Users}>{`Participantes (${participantesOrdenados.length})`}</SectionTitle>
            {participantesOrdenados.length === 0 ? (
              <p className="text-sm text-faint">Nenhum participante vinculado.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {participantesOrdenados.map((mp) => (
                  <li
                    key={mp.participant.id}
                    className="flex items-center gap-3 rounded-[13px] border border-hairline/6 bg-card p-3"
                  >
                    <Avatar iniciais={iniciais(mp.participant.name)} size={34} className="text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{mp.participant.name}</p>
                      <p className="truncate text-xs text-faint">
                        {mp.participant.department?.departmentName ?? "Sem departamento"} · {mp.participant.email}
                      </p>
                    </div>
                    <Badge tone={mp.participationType === "ORGANIZER" ? "success" : "neutral"}>
                      {PAPEL_LABELS[mp.participationType]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle icon={Scroll}>{`Transcrição (${falasOrdenadas.length} falas)`}</SectionTitle>
            {falasOrdenadas.length === 0 ? (
              <p className="text-sm text-faint">Esta reunião ainda não tem transcrição.</p>
            ) : (
              <ol className="flex flex-col gap-2 rounded-[13px] border border-hairline/6 bg-card p-3">
                {falasOrdenadas.map((line) => {
                  const alertas = alertasPorFala.get(line.id);
                  return (
                    <li
                      key={line.id}
                      className={`flex flex-col gap-1 rounded-[10px] border-l-2 px-3 py-2 text-sm ${
                        alertas ? "border-accent bg-accent/6" : "border-transparent"
                      }`}
                    >
                      <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                        {line.participant.name}
                        <span className="font-normal text-faint">{formatTime(line.spokenAt)}</span>
                        {alertas?.map((a) => (
                          <TermTag key={a.id} keyword={a.term.keyword} category={a.term.category} />
                        ))}
                      </span>
                      <span className="whitespace-pre-line break-words text-ink/90">{line.text}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section>
            <SectionTitle icon={ChatCircleDots}>{`Insights (${alertasOrdenados.length} alertas)`}</SectionTitle>
            {alertasOrdenados.length === 0 ? (
              <EmptyState
                icon={ChatCircleDots}
                title="Nenhum alerta gerado"
                description="Nenhuma fala desta reunião mencionou um termo do dicionário."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {alertasOrdenados.map((alert, i) => (
                  <AlertCard key={alert.id} alert={alert} onValidated={handleValidated} delayMs={i * 30} />
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
