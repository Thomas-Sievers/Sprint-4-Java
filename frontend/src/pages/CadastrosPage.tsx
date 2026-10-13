import { Buildings, BookOpen, Users } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CrudSection, type CrudConfig, type FieldErrors } from "../components/CrudSection";
import { Field } from "../components/Form";
import { PageHeader } from "../components/States";
import { TermTag } from "../components/TermTag";
import {
  createDepartment,
  createDictionaryTerm,
  createParticipant,
  deleteDepartment,
  deleteDictionaryTerm,
  deleteParticipant,
  listDepartments,
  listDictionaryTerms,
  listParticipants,
  updateDepartment,
  updateDictionaryTerm,
  updateParticipant,
} from "../lib/api";
import { CATEGORIA_LABELS, CATEGORIA_ORDEM } from "../lib/labels";
import { INPUT_CLASS, INPUT_ERROR_CLASS } from "../lib/ui";
import type {
  Department,
  DepartmentRequest,
  DictionaryTerm,
  DictionaryTermRequest,
  Participant,
  ParticipantRequest,
  TermCategory,
} from "../types/api";

const inputClass = (error?: string) => `${INPUT_CLASS} ${error ? INPUT_ERROR_CLASS : ""}`;

function required(value: string, max: number, errors: FieldErrors, key: string) {
  if (!value.trim()) errors[key] = "Campo obrigatório.";
  else if (value.trim().length > max) errors[key] = `Máximo de ${max} caracteres.`;
}

// ---------- Departamentos ----------

type DepartmentForm = { departmentName: string; acronym: string };

const departmentConfig: CrudConfig<Department, DepartmentForm, DepartmentRequest> = {
  noun: "departamento",
  load: listDepartments,
  create: createDepartment,
  update: updateDepartment,
  remove: deleteDepartment,
  sort: (a, b) => a.departmentName.localeCompare(b.departmentName),
  columns: [
    { header: "Nome", render: (d) => d.departmentName },
    { header: "Sigla", render: (d) => <span className="font-mono text-xs">{d.acronym}</span> },
  ],
  emptyForm: { departmentName: "", acronym: "" },
  toForm: (d) => ({ departmentName: d.departmentName, acronym: d.acronym ?? "" }),
  validate: (f) => {
    const e: FieldErrors = {};
    required(f.departmentName, 50, e, "departmentName");
    required(f.acronym, 10, e, "acronym");
    return e;
  },
  toRequest: (f) => ({ departmentName: f.departmentName.trim(), acronym: f.acronym.trim().toUpperCase() }),
  itemLabel: (d) => d.departmentName,
  renderFields: ({ form, set, errors, disabled }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_10rem]">
      <Field id="dep-nome" label="Nome" error={errors.departmentName}>
        <input
          id="dep-nome"
          value={form.departmentName}
          maxLength={50}
          disabled={disabled}
          onChange={(e) => set("departmentName", e.target.value)}
          placeholder="Ex.: Jurídico"
          className={inputClass(errors.departmentName)}
        />
      </Field>
      <Field id="dep-sigla" label="Sigla" error={errors.acronym}>
        <input
          id="dep-sigla"
          value={form.acronym}
          maxLength={10}
          disabled={disabled}
          onChange={(e) => set("acronym", e.target.value)}
          placeholder="JUR"
          className={`${inputClass(errors.acronym)} uppercase`}
        />
      </Field>
    </div>
  ),
};

// ---------- Participantes ----------

type ParticipantForm = { name: string; email: string; departmentId: string };

const byName = (a: Participant, b: Participant) => a.name.localeCompare(b.name);

function participantConfig(departments: Department[]): CrudConfig<Participant, ParticipantForm, ParticipantRequest> {
  return {
    noun: "participante",
    load: listParticipants,
    create: createParticipant,
    update: updateParticipant,
    remove: deleteParticipant,
    sort: byName,
    columns: [
      { header: "Nome", render: (p) => p.name },
      { header: "E-mail", render: (p) => <span className="text-muted">{p.email}</span> },
      {
        header: "Departamento",
        render: (p) => p.department?.departmentName ?? <span className="text-faint">—</span>,
      },
    ],
    emptyForm: { name: "", email: "", departmentId: "" },
    toForm: (p) => ({ name: p.name, email: p.email, departmentId: p.department ? String(p.department.id) : "" }),
    validate: (f) => {
      const e: FieldErrors = {};
      required(f.name, 100, e, "name");
      required(f.email, 100, e, "email");
      if (!e.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "E-mail inválido.";
      if (!f.departmentId) e.departmentId = "Escolha o departamento.";
      return e;
    },
    toRequest: (f) => ({ name: f.name.trim(), email: f.email.trim(), departmentId: Number(f.departmentId) }),
    itemLabel: (p) => p.name,
    renderFields: ({ form, set, errors, disabled }) => (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="par-nome" label="Nome" error={errors.name}>
          <input
            id="par-nome"
            value={form.name}
            maxLength={100}
            disabled={disabled}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex.: Ana Souza"
            className={inputClass(errors.name)}
          />
        </Field>
        <Field id="par-email" label="E-mail" error={errors.email}>
          <input
            id="par-email"
            type="email"
            value={form.email}
            maxLength={100}
            disabled={disabled}
            onChange={(e) => set("email", e.target.value)}
            placeholder="ana@empresa.com"
            className={inputClass(errors.email)}
          />
        </Field>
        <Field id="par-dep" label="Departamento" error={errors.departmentId}>
          <select
            id="par-dep"
            value={form.departmentId}
            disabled={disabled}
            onChange={(e) => set("departmentId", e.target.value)}
            className={inputClass(errors.departmentId)}
          >
            <option value="">Selecione…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.departmentName} ({d.acronym})
              </option>
            ))}
          </select>
        </Field>
      </div>
    ),
  };
}

function ParticipantsTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  useEffect(() => {
    let cancelled = false;
    listDepartments()
      .then((d) => {
        if (!cancelled) setDepartments([...d].sort((a, b) => a.departmentName.localeCompare(b.departmentName)));
      })
      .catch(() => {
        // the select stays empty; the tab's own list shows any connection error
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return <CrudSection config={participantConfig(departments)} />;
}

// ---------- Dicionário de termos ----------

type TermForm = { keyword: string; category: TermCategory | "" };

const termConfig: CrudConfig<DictionaryTerm, TermForm, DictionaryTermRequest> = {
  noun: "termo",
  load: listDictionaryTerms,
  create: createDictionaryTerm,
  update: updateDictionaryTerm,
  remove: deleteDictionaryTerm,
  sort: (a, b) =>
    CATEGORIA_ORDEM.indexOf(a.category) - CATEGORIA_ORDEM.indexOf(b.category) || a.keyword.localeCompare(b.keyword),
  columns: [
    { header: "Palavra-chave", render: (t) => <TermTag keyword={t.keyword} category={t.category} /> },
    { header: "Categoria", render: (t) => <span className="text-muted">{CATEGORIA_LABELS[t.category]}</span> },
  ],
  emptyForm: { keyword: "", category: "" },
  toForm: (t) => ({ keyword: t.keyword, category: t.category }),
  validate: (f) => {
    const e: FieldErrors = {};
    required(f.keyword, 50, e, "keyword");
    if (!f.category) e.category = "Escolha a categoria.";
    return e;
  },
  toRequest: (f) => ({ keyword: f.keyword.trim(), category: f.category as TermCategory }),
  itemLabel: (t) => t.keyword,
  renderFields: ({ form, set, errors, disabled }) => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="termo-palavra" label="Palavra-chave" error={errors.keyword}>
          <input
            id="termo-palavra"
            value={form.keyword}
            maxLength={50}
            disabled={disabled}
            onChange={(e) => set("keyword", e.target.value)}
            placeholder="Ex.: Senior"
            className={inputClass(errors.keyword)}
          />
        </Field>
        <Field id="termo-categoria" label="Categoria" error={errors.category}>
          <select
            id="termo-categoria"
            value={form.category}
            disabled={disabled}
            onChange={(e) => set("category", e.target.value as TermCategory | "")}
            className={inputClass(errors.category)}
          >
            <option value="">Selecione…</option>
            {CATEGORIA_ORDEM.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className="text-xs text-faint">
        Novos termos valem para as próximas transcrições analisadas. Palavras de até 3 letras (ex.: SAP, CRM) geram
        alertas com score 70, que vão para a validação.
      </p>
    </div>
  ),
};

// ---------- Page ----------

const TABS = [
  { id: "departamentos", label: "Departamentos", icon: Buildings },
  { id: "participantes", label: "Participantes", icon: Users },
  { id: "termos", label: "Dicionário de termos", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CadastrosPage() {
  const [params, setParams] = useSearchParams();
  const aba: TabId = TABS.some((t) => t.id === params.get("aba")) ? (params.get("aba") as TabId) : "departamentos";

  return (
    <>
      <PageHeader
        title="Cadastros"
        description="Departamentos, participantes e o dicionário de termos usado na análise das transcrições."
      />

      <div
        role="tablist"
        aria-label="Cadastros"
        className="mb-6 grid grid-cols-1 gap-1 rounded-[10px] border border-hairline/10 bg-hairline/4 p-1 sm:grid-cols-3"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const ativo = aba === t.id;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={ativo}
              aria-controls={`painel-${t.id}`}
              onClick={() => setParams({ aba: t.id }, { replace: true })}
              className={`flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                ativo ? "bg-accent/14 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`tab-${aba}`}>
        {aba === "departamentos" && <CrudSection key="departamentos" config={departmentConfig} />}
        {aba === "participantes" && <ParticipantsTab key="participantes" />}
        {aba === "termos" && <CrudSection key="termos" config={termConfig} />}
      </div>
    </>
  );
}
