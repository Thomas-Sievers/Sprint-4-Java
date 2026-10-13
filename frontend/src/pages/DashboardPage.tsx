import { CalendarBlank, CaretRight, Flag, Package, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChurnBadge } from "../components/ChurnBadge";
import { EmptyChart, HBarChart, VBarChart } from "../components/Charts";
import { StatCard } from "../components/StatCard";
import { EmptyState, ErrorState, PageHeader } from "../components/States";
import { listAlerts, listMeetings, listParticipants } from "../lib/api";
import { loadChurnRisks, newestFirst, type ChurnMap } from "../lib/churn";
import {
  alertsByConfidenceBand,
  alertsByStatus,
  averageScore,
  competitorMentionsByMeeting,
  meetingsByChurn,
  meetingsPerWeek,
  mentionsByKeyword,
} from "../lib/dashboard";
import { mensagemDeErro } from "../lib/errors";
import { formatDate, formatScore } from "../lib/format";
import { createTransitionClickHandler } from "../lib/viewTransition";
import type { GeneratedAlert, Meeting } from "../types/api";

interface Dados {
  meetings: Meeting[];
  alerts: GeneratedAlert[];
  totalParticipants: number;
  churn: ChurnMap;
}

const reunioes = (n: number) => `${n} ${n === 1 ? "reunião" : "reuniões"}`;
const alertas = (n: number) => `${n} ${n === 1 ? "alerta" : "alertas"}`;
const mencoes = (n: number) => `${n} ${n === 1 ? "menção" : "menções"}`;

function ChartCard({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="animate-fade-up rounded-[13px] border border-hairline/6 bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-[13px] bg-hairline/6" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-[13px] bg-hairline/6" />
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [dados, setDados] = useState<Dados | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listMeetings(), listAlerts(), listParticipants()])
      .then(async ([meetings, alerts, participants]) => {
        const churn = await loadChurnRisks(meetings);
        if (!cancelled) setDados({ meetings, alerts, totalParticipants: participants.length, churn });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(mensagemDeErro(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const calc = useMemo(() => {
    if (!dados) return null;
    const competitorCount = competitorMentionsByMeeting(dados.alerts);
    return {
      pendentes: dados.alerts.filter((a) => a.validationStatus === "PENDING").length,
      porRisco: meetingsByChurn(dados.meetings, dados.churn),
      porStatus: alertsByStatus(dados.alerts),
      porFaixa: alertsByConfidenceBand(dados.alerts),
      media: averageScore(dados.alerts),
      concorrentes: mentionsByKeyword(dados.alerts, "COMPETITOR"),
      produtos: mentionsByKeyword(dados.alerts, "OWN_PRODUCT"),
      porSemana: meetingsPerWeek(dados.meetings),
      emAtencao: newestFirst(dados.meetings.filter((m) => dados.churn[m.id] === "High")).map((m) => ({
        meeting: m,
        concorrentes: competitorCount.get(m.id) ?? 0,
      })),
    };
  }, [dados]);

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral das reuniões, alertas e riscos de churn." />

      {error ? (
        <ErrorState
          title="Não foi possível carregar o dashboard"
          message={error}
          onRetry={() => {
            setError(null);
            setDados(null);
            setReloadKey((k) => k + 1);
          }}
        />
      ) : !dados || !calc ? (
        <DashboardSkeleton />
      ) : dados.meetings.length === 0 ? (
        <EmptyState
          icon={CalendarBlank}
          title="Ainda sem reuniões registradas"
          description="Assim que a primeira reunião for analisada, os gráficos aparecem aqui."
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
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Reuniões" value={dados.meetings.length} />
            <StatCard label="Participantes" value={dados.totalParticipants} delayMs={40} />
            <Link
              to="/validacao"
              onClick={createTransitionClickHandler(navigate, "/validacao")}
              aria-label={`${calc.pendentes} alertas pendentes — abrir a fila de validação`}
              className="group relative rounded-[13px] focus-visible:outline-2 focus-visible:outline-accent"
            >
              <StatCard
                label="Alertas pendentes"
                value={calc.pendentes}
                tone={calc.pendentes > 0 ? "danger" : "default"}
                delayMs={80}
              />
              <CaretRight
                size={16}
                aria-hidden="true"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-chevron transition-colors duration-150 group-hover:text-ink"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Reuniões por risco de churn">
              <HBarChart title="Reuniões por risco de churn" data={calc.porRisco} unit={reunioes} labelWidth={56} />
              <p className="mt-1 text-center text-xs text-faint">
                Menções a concorrentes por reunião: 0–1 baixo, 2–3 médio, 4+ alto.
              </p>
            </ChartCard>

            <ChartCard title="Reuniões por semana">
              <VBarChart title="Reuniões por semana" data={calc.porSemana} unit={reunioes} />
            </ChartCard>

            <ChartCard title="Alertas por status">
              <HBarChart title="Alertas por status" data={calc.porStatus} unit={alertas} labelWidth={80} />
              {calc.pendentes > 0 && (
                <Link
                  to="/validacao"
                  onClick={createTransitionClickHandler(navigate, "/validacao")}
                  className="mt-2 flex items-center justify-center gap-1 rounded-[10px] bg-warning-bg px-3 py-2 text-sm font-semibold text-warning-text transition-colors duration-150 hover:bg-warning/20"
                >
                  {calc.pendentes} pendente{calc.pendentes === 1 ? "" : "s"} para validar
                </Link>
              )}
            </ChartCard>

            <ChartCard title="Faixas de confiança">
              {dados.alerts.length === 0 ? (
                <EmptyChart height={160}>Nenhum alerta gerado ainda</EmptyChart>
              ) : (
                <>
                  <VBarChart title="Alertas por faixa de confiança" data={calc.porFaixa} unit={alertas} height={160} />
                  <p className="mt-1 text-center text-xs text-faint">
                    Score médio: {formatScore(Math.round(calc.media * 10) / 10)} · baixa &lt;70, média 70–84, alta 85+
                  </p>
                </>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Concorrentes mais mencionados" icon={<Flag size={16} aria-hidden="true" className="text-dim" />}>
            {calc.concorrentes.length === 0 ? (
              <EmptyChart>Nenhum concorrente citado nas reuniões</EmptyChart>
            ) : (
              <HBarChart title="Concorrentes mais mencionados" data={calc.concorrentes} unit={mencoes} labelWidth={110} />
            )}
          </ChartCard>

          <ChartCard title="Produtos TOTVS mencionados" icon={<Package size={16} aria-hidden="true" className="text-dim" />}>
            {calc.produtos.length === 0 ? (
              <EmptyChart>Nenhum produto TOTVS citado nas reuniões</EmptyChart>
            ) : (
              <HBarChart
                title="Produtos TOTVS mencionados"
                data={calc.produtos}
                unit={mencoes}
                color="var(--color-accent-2)"
                labelWidth={110}
              />
            )}
          </ChartCard>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <WarningCircle size={16} aria-hidden="true" className="text-dim" />
              Reuniões em atenção
            </h2>
            {calc.emAtencao.length === 0 ? (
              <p className="text-sm text-faint">Nenhuma reunião com risco alto de churn agora.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {calc.emAtencao.map(({ meeting, concorrentes }) => (
                  <li key={meeting.id}>
                    <Link
                      to={`/reunioes/${meeting.id}`}
                      onClick={createTransitionClickHandler(navigate, `/reunioes/${meeting.id}`)}
                      className="flex items-center gap-3 rounded-[10px] bg-hairline/4 p-3 transition-colors duration-150 hover:bg-hairline/8"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{meeting.title}</span>
                        <span className="block text-xs text-faint">
                          {formatDate(meeting.startDateTime)} · {mencoes(concorrentes)} a concorrentes
                        </span>
                      </span>
                      <ChurnBadge risk="High" />
                      <CaretRight size={16} aria-hidden="true" className="shrink-0 text-chevron" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
