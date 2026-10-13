import { CalendarBlank, CheckCircle, Clock, PencilSimple, Quotes, User, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateAlert } from "../lib/api";
import { mensagemDeErro } from "../lib/errors";
import { formatDate, formatTime } from "../lib/format";
import { STATUS_LABELS, STATUS_TONE } from "../lib/labels";
import { createTransitionClickHandler } from "../lib/viewTransition";
import type { GeneratedAlert } from "../types/api";
import { Badge } from "./Badge";
import { ScoreConfianca } from "./ScoreConfianca";
import { TermTag } from "./TermTag";

const NOTE_MAX = 200;

/**
 * One generated alert: term, evidence (`note`), the transcript line that raised it,
 * score and status. Pending alerts get the human validation actions (rule 4.2):
 * "Confirmar" → VALIDATED, "Corrigir" + note → CORRECTED.
 */
export function AlertCard({
  alert,
  onValidated,
  showMeeting = false,
  delayMs = 0,
}: {
  alert: GeneratedAlert;
  onValidated: (updated: GeneratedAlert) => void;
  showMeeting?: boolean;
  delayMs?: number;
}) {
  const navigate = useNavigate();
  const [corrigindo, setCorrigindo] = useState(false);
  const [correcao, setCorrecao] = useState("");
  const [enviando, setEnviando] = useState<"confirmar" | "corrigir" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const line = alert.transcriptLine;
  const meeting = line.meeting;
  const isBusy = enviando !== null;

  async function enviar(confirmed: boolean) {
    setError(null);
    setEnviando(confirmed ? "confirmar" : "corrigir");
    try {
      const updated = await validateAlert(
        alert.id,
        confirmed ? { confirmed: true } : { confirmed: false, correctedNote: correcao.trim() },
      );
      onValidated(updated);
    } catch (err) {
      setError(mensagemDeErro(err));
      setEnviando(null);
    }
  }

  return (
    <li
      className="animate-fade-up flex flex-col gap-3 rounded-[13px] border border-hairline/6 bg-card p-4"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TermTag keyword={alert.term.keyword} category={alert.term.category} />
          <Badge tone={STATUS_TONE[alert.validationStatus]}>{STATUS_LABELS[alert.validationStatus]}</Badge>
        </div>
        <ScoreConfianca score={alert.confidenceScore} />
      </div>

      {showMeeting && (
        <Link
          to={`/reunioes/${meeting.id}`}
          onClick={createTransitionClickHandler(navigate, `/reunioes/${meeting.id}`)}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-ink transition-colors duration-150 hover:text-accent-text"
        >
          <CalendarBlank size={14} aria-hidden="true" className="text-dim" />
          {meeting.title}
          <span className="font-normal text-faint">· {formatDate(meeting.startDateTime)}</span>
        </Link>
      )}

      {alert.note && (
        <p className="text-sm text-ink/90">
          <span className="sr-only">Evidência: </span>
          {alert.note}
        </p>
      )}

      <div className="flex gap-2 rounded-[10px] bg-hairline/4 px-3 py-2 text-sm text-muted">
        <Quotes size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-dim" />
        <div className="flex flex-col gap-1">
          <span className="italic">“{line.text}”</span>
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
            <span className="inline-flex items-center gap-1">
              <User size={12} aria-hidden="true" />
              {line.participant.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden="true" />
              {formatTime(line.spokenAt)}
            </span>
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-[10px] bg-danger-bg px-3 py-2 text-sm text-danger-text">
          <WarningCircle size={16} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {alert.validationStatus === "PENDING" &&
        (corrigindo ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`correcao-${alert.id}`} className="text-xs font-medium text-muted">
              Observação corrigida
            </label>
            <textarea
              id={`correcao-${alert.id}`}
              value={correcao}
              onChange={(e) => setCorrecao(e.target.value)}
              placeholder="Descreva o que está errado neste alerta…"
              rows={2}
              maxLength={NOTE_MAX}
              disabled={isBusy}
              className="rounded-[10px] border border-hairline/10 bg-hairline/4 px-3 py-2 text-sm text-ink placeholder:text-dim outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isBusy || !correcao.trim()}
                onClick={() => enviar(false)}
                className="rounded-[10px] bg-accent px-3 py-1.5 text-sm font-bold text-accent-ink transition-colors duration-150 hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando === "corrigir" ? "Enviando…" : "Enviar correção"}
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setCorrigindo(false);
                  setCorrecao("");
                }}
                className="rounded-[10px] px-3 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-hairline/6"
              >
                Cancelar
              </button>
              <span className="ml-auto text-xs text-faint">
                {correcao.length}/{NOTE_MAX}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => enviar(true)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-success/30 px-3 py-1.5 text-sm font-medium text-success-text transition-colors duration-150 hover:bg-success/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle size={16} aria-hidden="true" />
              {enviando === "confirmar" ? "Enviando…" : "Confirmar"}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setCorrigindo(true)}
              className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-hairline/6 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PencilSimple size={16} aria-hidden="true" />
              Corrigir…
            </button>
          </div>
        ))}
    </li>
  );
}
