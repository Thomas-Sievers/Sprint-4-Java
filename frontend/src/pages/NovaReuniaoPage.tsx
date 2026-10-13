import {
  ArrowRight,
  CheckCircle,
  ListChecks,
  MagicWand,
  Plus,
  Trash,
  Users,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/Badge";
import { ChurnBadge } from "../components/ChurnBadge";
import { Field, FormBanner } from "../components/Form";
import { ScoreConfianca } from "../components/ScoreConfianca";
import { StatCard } from "../components/StatCard";
import { PageHeader } from "../components/States";
import { TermTag } from "../components/TermTag";
import {
  ApiError,
  addMeetingParticipant,
  analyzeTranscript,
  createMeeting,
  listParticipants,
} from "../lib/api";
import { mensagemDeErro } from "../lib/errors";
import { formatDate, formatScore } from "../lib/format";
import { PAPEL_LABELS, PAPEL_ORDEM, STATUS_LABELS, STATUS_TONE } from "../lib/labels";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS, INPUT_ERROR_CLASS } from "../lib/ui";
import { createTransitionClickHandler } from "../lib/viewTransition";
import type {
  Meeting,
  MeetingParticipant,
  Participant,
  ParticipationType,
  TranscriptAnalysisResult,
} from "../types/api";

const PASSOS = ["Reunião", "Participantes", "Transcrição", "Resultado"] as const;

// Example lines for the demo: 4 competitor mentions (SAP twice, Salesforce,
// Concorrente X) → High churn risk; SAP/CRM/ERP score 70 → human validation.
const FALAS_EXEMPLO = [
  "Hoje usamos o SAP no financeiro, mas o contrato vence no fim do ano.",
  "A Salesforce mandou uma proposta para trocar o nosso CRM na semana passada.",
  "Queremos entender como o Protheus se integra com o ERP que já temos.",
  "O Concorrente X ofereceu desconto, e a SAP também ligou de novo.",
];

interface Fala {
  key: number;
  participantId: number | "";
  hora: string;
  texto: string;
}

type FalaErros = Partial<Record<"participantId" | "hora" | "texto", string>>;

function hoje(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function minutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function hora(minutosDoDia: number): string {
  const h = Math.floor(minutosDoDia / 60);
  const m = minutosDoDia % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "HH:MM" part of an API LocalDateTime. */
function horaDe(iso: string): string {
  return iso.slice(11, 16);
}

let proximaChave = 1;
function novaFala(partial: Partial<Fala> = {}): Fala {
  return { key: proximaChave++, participantId: "", hora: "", texto: "", ...partial };
}

function Passos({ atual }: { atual: number }) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-2" aria-label="Etapas">
      {PASSOS.map((nome, i) => {
        const feito = i < atual;
        const ativo = i === atual;
        return (
          <li key={nome} className="flex items-center gap-2">
            <span
              aria-current={ativo ? "step" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                ativo
                  ? "bg-accent/14 text-accent-text"
                  : feito
                    ? "bg-success-bg text-success-text"
                    : "bg-hairline/6 text-faint"
              }`}
            >
              {feito ? <CheckCircle size={14} weight="fill" aria-hidden="true" /> : <span>{i + 1}.</span>}
              {nome}
            </span>
            {i < PASSOS.length - 1 && <span aria-hidden="true" className="h-px w-4 bg-hairline/10" />}
          </li>
        );
      })}
    </ol>
  );
}

function Card({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="animate-fade-up rounded-[13px] border border-hairline/6 bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink">{titulo}</h2>
      {children}
    </section>
  );
}

function Concluido({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-[13px] border border-hairline/6 bg-card px-4 py-3 text-sm text-muted">
      <CheckCircle size={18} weight="fill" aria-hidden="true" className="shrink-0 text-success-text" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function NovaReuniaoPage() {
  const navigate = useNavigate();

  // Step 1 — meeting
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState(hoje);
  const [inicio, setInicio] = useState("10:00");
  const [fim, setFim] = useState("11:00");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [erros1, setErros1] = useState<Record<string, string>>({});

  // Step 2 — participants
  const [participantes, setParticipantes] = useState<Participant[] | null>(null);
  const [erroParticipantes, setErroParticipantes] = useState<string | null>(null);
  const [selecao, setSelecao] = useState<Record<number, ParticipationType>>({});
  const [vinculados, setVinculados] = useState<MeetingParticipant[]>([]);
  const [passo2Concluido, setPasso2Concluido] = useState(false);

  // Step 3 — transcript
  const [falas, setFalas] = useState<Fala[]>(() => [novaFala()]);
  const [errosFalas, setErrosFalas] = useState<Record<number, FalaErros>>({});
  const [resultado, setResultado] = useState<TranscriptAnalysisResult | null>(null);

  const [banner, setBanner] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [reloadParticipantes, setReloadParticipantes] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listParticipants()
      .then((data) => {
        if (!cancelled) setParticipantes([...data].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((err: unknown) => {
        if (!cancelled) setErroParticipantes(mensagemDeErro(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadParticipantes]);

  const passo = !meeting ? 0 : !passo2Concluido ? 1 : !resultado ? 2 : 3;
  const organizadorId = Object.entries(selecao).find(([, papel]) => papel === "ORGANIZER")?.[0];
  const linkedIds = useMemo(() => new Set(vinculados.map((v) => v.participant.id)), [vinculados]);

  // ---------- Step 1 ----------

  async function criarReuniao(event: FormEvent) {
    event.preventDefault();
    setBanner(null);
    const erros: Record<string, string> = {};
    if (!titulo.trim()) erros.title = "Informe o título.";
    else if (titulo.trim().length > 100) erros.title = "Máximo de 100 caracteres.";
    if (!data) erros.data = "Informe a data.";
    if (!inicio) erros.startDateTime = "Informe o início.";
    if (!fim) erros.endDateTime = "Informe o fim.";
    else if (inicio && minutos(fim) < minutos(inicio)) erros.endDateTime = "O fim não pode ser antes do início.";
    setErros1(erros);
    if (Object.keys(erros).length) return;

    setEnviando(true);
    try {
      const criada = await createMeeting({
        title: titulo.trim(),
        startDateTime: `${data}T${inicio}:00`,
        endDateTime: `${data}T${fim}:00`,
      });
      setMeeting(criada);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErros1(err.fields);
      else setBanner(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Step 2 ----------

  function alternarParticipante(id: number) {
    setSelecao((s) => {
      const next = { ...s };
      if (id in next) delete next[id];
      else next[id] = "LISTENER";
      return next;
    });
  }

  async function vincularParticipantes() {
    if (!meeting) return;
    setBanner(null);
    const pendentes = Object.entries(selecao)
      .map(([id, papel]) => ({ id: Number(id), papel }))
      .filter((p) => !linkedIds.has(p.id))
      // Organizer first, so the "one organizer" rule is checked before the others.
      .sort((a, b) => PAPEL_ORDEM.indexOf(a.papel) - PAPEL_ORDEM.indexOf(b.papel));

    if (Object.keys(selecao).length === 0) {
      setBanner("Selecione pelo menos um participante.");
      return;
    }

    setEnviando(true);
    try {
      // One POST per participant, in order, so a failure says exactly who was not linked.
      for (const p of pendentes) {
        try {
          const vinculo = await addMeetingParticipant(meeting.id, {
            participantId: p.id,
            participationType: p.papel,
          });
          setVinculados((v) => [...v, vinculo]);
        } catch (err) {
          const nome = participantes?.find((x) => x.id === p.id)?.name ?? `#${p.id}`;
          setBanner(`${nome}: ${mensagemDeErro(err)}`);
          return;
        }
      }
      setPasso2Concluido(true);
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Step 3 ----------

  function atualizarFala(key: number, patch: Partial<Fala>) {
    setFalas((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  function preencherExemplo() {
    if (!meeting) return;
    const ini = minutos(horaDe(meeting.startDateTime));
    const fimMin = meeting.endDateTime ? minutos(horaDe(meeting.endDateTime)) : ini + 60;
    const passoMin = Math.max(0, Math.floor((fimMin - ini) / (FALAS_EXEMPLO.length + 1)));
    setErrosFalas({});
    setFalas(
      FALAS_EXEMPLO.map((texto, i) =>
        novaFala({
          participantId: vinculados[i % vinculados.length]?.participant.id ?? "",
          hora: hora(ini + passoMin * (i + 1)),
          texto,
        }),
      ),
    );
  }

  async function analisar() {
    if (!meeting) return;
    setBanner(null);

    const ini = horaDe(meeting.startDateTime);
    const fimH = meeting.endDateTime ? horaDe(meeting.endDateTime) : null;
    const erros: Record<number, FalaErros> = {};
    falas.forEach((f) => {
      const e: FalaErros = {};
      if (f.participantId === "") e.participantId = "Escolha quem falou.";
      if (!f.hora) e.hora = "Informe o horário.";
      else if (f.hora < ini || (fimH && f.hora > fimH))
        e.hora = `Fora da reunião (${ini}${fimH ? `–${fimH}` : ""}).`;
      if (!f.texto.trim()) e.texto = "Escreva a fala.";
      else if (f.texto.length > 4000) e.texto = "Máximo de 4000 caracteres.";
      if (Object.keys(e).length) erros[f.key] = e;
    });
    setErrosFalas(erros);
    if (Object.keys(erros).length) return;

    const dataReuniao = meeting.startDateTime.slice(0, 10);
    setEnviando(true);
    try {
      const res = await analyzeTranscript(meeting.id, {
        lines: falas.map((f) => ({
          participantId: Number(f.participantId),
          spokenAt: `${dataReuniao}T${f.hora}:00`,
          text: f.texto.trim(),
        })),
      });
      setResultado(res);
    } catch (err) {
      setBanner(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  function recomecar() {
    setTitulo("");
    setData(hoje());
    setInicio("10:00");
    setFim("11:00");
    setMeeting(null);
    setErros1({});
    setSelecao({});
    setVinculados([]);
    setPasso2Concluido(false);
    setFalas([novaFala()]);
    setErrosFalas({});
    setResultado(null);
    setBanner(null);
  }

  // ---------- Render ----------

  return (
    <>
      <PageHeader
        title="Nova Reunião"
        description="Cadastre a reunião, vincule os participantes e envie a transcrição para a análise de termos."
      />
      <Passos atual={passo} />

      <div className="flex flex-col gap-4">
        {/* Step 1 */}
        {meeting ? (
          <Concluido>
            <span className="font-semibold text-ink">{meeting.title}</span> · {formatDate(meeting.startDateTime)},{" "}
            {horaDe(meeting.startDateTime)}
            {meeting.endDateTime && `–${horaDe(meeting.endDateTime)}`}
          </Concluido>
        ) : (
          <Card titulo="1. Reunião">
            <form onSubmit={criarReuniao} noValidate className="flex flex-col gap-4">
              <Field id="titulo" label="Título" error={erros1.title}>
                <input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={100}
                  placeholder="Ex.: Renovação de contrato — Cliente ACME"
                  className={`${INPUT_CLASS} ${erros1.title ? INPUT_ERROR_CLASS : ""}`}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field id="data" label="Data" error={erros1.data}>
                  <input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={`${INPUT_CLASS} ${erros1.data ? INPUT_ERROR_CLASS : ""}`}
                  />
                </Field>
                <Field id="inicio" label="Início" error={erros1.startDateTime}>
                  <input
                    id="inicio"
                    type="time"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    className={`${INPUT_CLASS} ${erros1.startDateTime ? INPUT_ERROR_CLASS : ""}`}
                  />
                </Field>
                <Field id="fim" label="Fim" error={erros1.endDateTime}>
                  <input
                    id="fim"
                    type="time"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                    className={`${INPUT_CLASS} ${erros1.endDateTime ? INPUT_ERROR_CLASS : ""}`}
                  />
                </Field>
              </div>
              {banner && <FormBanner>{banner}</FormBanner>}
              <div>
                <button type="submit" disabled={enviando} className={BUTTON_PRIMARY}>
                  {enviando ? "Criando…" : "Criar reunião"}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 2 */}
        {passo > 1 ? (
          <Concluido>
            <span className="font-semibold text-ink">{vinculados.length} participantes:</span>{" "}
            {vinculados.map((v) => `${v.participant.name} (${PAPEL_LABELS[v.participationType]})`).join(", ")}
          </Concluido>
        ) : (
          passo === 1 && (
            <Card titulo="2. Participantes">
              {erroParticipantes ? (
                <FormBanner>
                  Não foi possível carregar os participantes: {erroParticipantes}{" "}
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-2"
                    onClick={() => {
                      setErroParticipantes(null);
                      setReloadParticipantes((k) => k + 1);
                    }}
                  >
                    Tentar novamente
                  </button>
                </FormBanner>
              ) : participantes === null ? (
                <p className="text-sm text-faint">Carregando participantes…</p>
              ) : participantes.length === 0 ? (
                <p className="text-sm text-muted">
                  Nenhum participante cadastrado. Cadastre em{" "}
                  <Link to="/cadastros" className="font-semibold text-accent-text underline underline-offset-2">
                    Cadastros
                  </Link>
                  .
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted">
                    Escolha quem participou e o papel de cada um. A reunião pode ter no máximo um organizador.
                  </p>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {participantes.map((p) => {
                      const selecionado = p.id in selecao;
                      const travado = linkedIds.has(p.id);
                      return (
                        <li
                          key={p.id}
                          className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 transition-colors duration-150 ${
                            selecionado ? "border-accent/40 bg-accent/6" : "border-hairline/8"
                          }`}
                        >
                          <input
                            id={`p-${p.id}`}
                            type="checkbox"
                            checked={selecionado}
                            disabled={travado || enviando}
                            onChange={() => alternarParticipante(p.id)}
                            className="h-4 w-4 accent-[var(--color-accent)]"
                          />
                          <label htmlFor={`p-${p.id}`} className="min-w-0 flex-1 cursor-pointer">
                            <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                            <span className="block truncate text-xs text-faint">
                              {p.department?.acronym ?? "—"} · {p.email}
                            </span>
                          </label>
                          {selecionado && (
                            <select
                              aria-label={`Papel de ${p.name}`}
                              value={selecao[p.id]}
                              disabled={travado || enviando}
                              onChange={(e) =>
                                setSelecao((s) => ({ ...s, [p.id]: e.target.value as ParticipationType }))
                              }
                              className="rounded-[8px] border border-hairline/10 bg-card px-2 py-1 text-xs text-ink outline-none focus:border-accent"
                            >
                              {PAPEL_ORDEM.map((papel) => (
                                <option
                                  key={papel}
                                  value={papel}
                                  disabled={papel === "ORGANIZER" && organizadorId !== undefined && organizadorId !== String(p.id)}
                                >
                                  {PAPEL_LABELS[papel]}
                                </option>
                              ))}
                            </select>
                          )}
                          {travado && <CheckCircle size={16} weight="fill" aria-label="Vinculado" className="text-success-text" />}
                        </li>
                      );
                    })}
                  </ul>
                  {banner && <FormBanner>{banner}</FormBanner>}
                  <div>
                    <button type="button" onClick={vincularParticipantes} disabled={enviando} className={BUTTON_PRIMARY}>
                      <Users size={16} aria-hidden="true" />
                      {enviando
                        ? "Vinculando…"
                        : `Vincular ${Object.keys(selecao).length || ""} participante${Object.keys(selecao).length === 1 ? "" : "s"}`}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )
        )}

        {/* Step 3 */}
        {passo > 2 ? (
          <Concluido>
            <span className="font-semibold text-ink">{resultado?.transcriptLines.length} falas</span> enviadas e analisadas.
          </Concluido>
        ) : (
          passo === 2 && (
            <Card titulo="3. Transcrição">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted">
                    Cada fala precisa de quem falou e de um horário dentro da reunião.
                  </p>
                  <button type="button" onClick={preencherExemplo} disabled={enviando} className={BUTTON_SECONDARY}>
                    <MagicWand size={16} aria-hidden="true" />
                    Preencher exemplo
                  </button>
                </div>

                <ol className="flex flex-col gap-3">
                  {falas.map((f, i) => {
                    const e = errosFalas[f.key] ?? {};
                    return (
                      <li key={f.key} className="flex flex-col gap-3 rounded-[10px] border border-hairline/8 bg-hairline/3 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-faint">Fala {i + 1}</span>
                          {falas.length > 1 && (
                            <button
                              type="button"
                              aria-label={`Remover fala ${i + 1}`}
                              onClick={() => setFalas((fs) => fs.filter((x) => x.key !== f.key))}
                              className="rounded-md p-1 text-dim transition-colors duration-150 hover:bg-hairline/8 hover:text-danger-text"
                            >
                              <Trash size={16} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
                          <Field id={`quem-${f.key}`} label="Participante" error={e.participantId}>
                            <select
                              id={`quem-${f.key}`}
                              value={f.participantId}
                              onChange={(ev) =>
                                atualizarFala(f.key, {
                                  participantId: ev.target.value === "" ? "" : Number(ev.target.value),
                                })
                              }
                              className={`${INPUT_CLASS} ${e.participantId ? INPUT_ERROR_CLASS : ""}`}
                            >
                              <option value="">Selecione…</option>
                              {vinculados.map((v) => (
                                <option key={v.participant.id} value={v.participant.id}>
                                  {v.participant.name}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field id={`hora-${f.key}`} label="Horário" error={e.hora}>
                            <input
                              id={`hora-${f.key}`}
                              type="time"
                              value={f.hora}
                              onChange={(ev) => atualizarFala(f.key, { hora: ev.target.value })}
                              className={`${INPUT_CLASS} ${e.hora ? INPUT_ERROR_CLASS : ""}`}
                            />
                          </Field>
                        </div>
                        <Field id={`texto-${f.key}`} label="Fala" error={e.texto}>
                          <textarea
                            id={`texto-${f.key}`}
                            rows={2}
                            maxLength={4000}
                            value={f.texto}
                            onChange={(ev) => atualizarFala(f.key, { texto: ev.target.value })}
                            placeholder="O que foi dito…"
                            className={`${INPUT_CLASS} ${e.texto ? INPUT_ERROR_CLASS : ""}`}
                          />
                        </Field>
                      </li>
                    );
                  })}
                </ol>

                <div>
                  <button
                    type="button"
                    onClick={() => setFalas((fs) => [...fs, novaFala()])}
                    disabled={enviando}
                    className={BUTTON_SECONDARY}
                  >
                    <Plus size={16} aria-hidden="true" />
                    Adicionar fala
                  </button>
                </div>

                {banner && <FormBanner>{banner}</FormBanner>}

                <div>
                  <button type="button" onClick={analisar} disabled={enviando} className={BUTTON_PRIMARY}>
                    {enviando ? "Analisando…" : "Enviar e analisar"}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </Card>
          )
        )}

        {/* Step 4 */}
        {resultado && meeting && (
          <Card titulo="4. Resultado da análise">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted">
                  {resultado.alerts.length === 0
                    ? "Nenhum termo do dicionário foi encontrado nas falas."
                    : "Cada termo do dicionário encontrado nas falas gerou um alerta."}
                </p>
                <ChurnBadge risk={resultado.churnRisk} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label="Alertas criados" value={resultado.alerts.length} />
                <StatCard
                  label="Pendentes de validação"
                  value={resultado.pendingAlerts}
                  tone={resultado.pendingAlerts > 0 ? "danger" : "default"}
                  delayMs={40}
                />
                <StatCard
                  label="Score médio de confiança"
                  value={resultado.averageConfidenceScore}
                  format={formatScore}
                  delayMs={80}
                />
              </div>

              {resultado.alerts.length > 0 && (
                <ul className="flex flex-col divide-y divide-hairline/6 rounded-[10px] border border-hairline/8">
                  {resultado.alerts.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                      <TermTag keyword={a.term.keyword} category={a.term.category} />
                      <span className="min-w-0 flex-1 truncate text-xs text-faint">
                        {a.transcriptLine.participant.name} · {horaDe(a.transcriptLine.spokenAt)}
                      </span>
                      <ScoreConfianca score={a.confidenceScore} />
                      <Badge tone={STATUS_TONE[a.validationStatus]}>{STATUS_LABELS[a.validationStatus]}</Badge>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/reunioes/${meeting.id}`}
                  onClick={createTransitionClickHandler(navigate, `/reunioes/${meeting.id}`)}
                  className={BUTTON_PRIMARY}
                >
                  Abrir reunião
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {resultado.pendingAlerts > 0 && (
                  <Link
                    to="/validacao"
                    onClick={createTransitionClickHandler(navigate, "/validacao")}
                    className={BUTTON_SECONDARY}
                  >
                    <ListChecks size={16} aria-hidden="true" />
                    Validar pendentes
                  </Link>
                )}
                <button type="button" onClick={recomecar} className={BUTTON_SECONDARY}>
                  <Plus size={16} aria-hidden="true" />
                  Registrar outra reunião
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
