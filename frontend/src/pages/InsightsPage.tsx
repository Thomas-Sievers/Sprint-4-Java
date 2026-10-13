import { CheckCircle, ListChecks } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { AlertCard } from "../components/AlertCard";
import { FormBanner } from "../components/Form";
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from "../components/States";
import { listPendingAlerts } from "../lib/api";
import { mensagemDeErro } from "../lib/errors";
import type { GeneratedAlert } from "../types/api";

/**
 * Human validation queue (rule 4.1/4.2): alerts with score < 80 stay PENDING
 * until someone confirms or corrects them.
 */
export function InsightsPage() {
  const [alertas, setAlertas] = useState<GeneratedAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listPendingAlerts()
      .then((data) => {
        if (cancelled) return;
        // Oldest mention first: the queue is worked in the order things were said.
        setAlertas([...data].sort((a, b) => a.transcriptLine.spokenAt.localeCompare(b.transcriptLine.spokenAt)));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(mensagemDeErro(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleValidated(updated: GeneratedAlert) {
    setAlertas((list) => list?.filter((a) => a.id !== updated.id) ?? null);
    setUltimo(
      updated.validationStatus === "VALIDATED"
        ? `Alerta "${updated.term.keyword}" confirmado.`
        : `Alerta "${updated.term.keyword}" corrigido.`,
    );
  }

  return (
    <>
      <PageHeader
        title="Validação"
        description="Alertas com score de confiança abaixo de 80 aguardam revisão humana antes de serem considerados."
      >
        {alertas && alertas.length > 0 && (
          <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning-text">
            {alertas.length} pendente{alertas.length === 1 ? "" : "s"}
          </span>
        )}
      </PageHeader>

      {ultimo && (
        <div className="mb-4">
          <FormBanner tone="success">{ultimo}</FormBanner>
        </div>
      )}

      {error ? (
        <ErrorState
          title="Não foi possível carregar a fila de validação"
          message={error}
          onRetry={() => {
            setError(null);
            setAlertas(null);
            setReloadKey((k) => k + 1);
          }}
        />
      ) : alertas === null ? (
        <ListSkeleton rows={3} />
      ) : alertas.length === 0 ? (
        <EmptyState
          icon={ultimo ? CheckCircle : ListChecks}
          title="Nenhum alerta pendente"
          description="Todos os alertas já foram revisados. Novas transcrições podem gerar novos pendentes."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {alertas.map((alert, i) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onValidated={handleValidated}
              showMeeting
              delayMs={Math.min(i, 10) * 40}
            />
          ))}
        </ul>
      )}
    </>
  );
}
