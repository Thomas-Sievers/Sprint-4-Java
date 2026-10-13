import { PencilSimple, Plus, Trash, X } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ApiError } from "../lib/api";
import { mensagemDeErro } from "../lib/errors";
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../lib/ui";
import { FormBanner } from "./Form";
import { ErrorState, ListSkeleton } from "./States";

export type FieldErrors = Record<string, string>;

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

export interface CrudConfig<T extends { id: number }, F, R> {
  /** Singular noun, lowercase ("departamento"). */
  noun: string;
  /** Feminine noun → "Nova", "excluída"... */
  feminine?: boolean;
  load: () => Promise<T[]>;
  create: (request: R) => Promise<T>;
  update: (id: number, request: R) => Promise<T>;
  remove: (id: number) => Promise<void>;
  columns: Column<T>[];
  emptyForm: F;
  toForm: (item: T) => F;
  /** Client-side checks; keys are the API field names so API 400 errors land in the same place. */
  validate: (form: F) => FieldErrors;
  toRequest: (form: F) => R;
  renderFields: (props: {
    form: F;
    set: <K extends keyof F>(key: K, value: F[K]) => void;
    errors: FieldErrors;
    disabled: boolean;
  }) => ReactNode;
  itemLabel: (item: T) => string;
  /** Keep it a module-level function: it is an effect dependency. */
  sort?: (a: T, b: T) => number;
}

/**
 * Table + create/edit form + delete with confirmation for one API resource.
 * API 400 field errors go under the fields; 422/404 messages go to a banner.
 */
export function CrudSection<T extends { id: number }, F, R>({ config }: { config: CrudConfig<T, F, R> }) {
  const { noun, feminine } = config;
  const [items, setItems] = useState<T[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<F>(config.emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [banner, setBanner] = useState<{ tone: "danger" | "success"; text: string } | null>(null);

  // `load` and `sort` must be stable (module-level functions), so the list only
  // refetches on an explicit reload.
  const { load, sort } = config;
  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setItems(sort ? [...data].sort(sort) : data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(mensagemDeErro(err));
      });
    return () => {
      cancelled = true;
    };
  }, [load, sort, reloadKey]);

  function openCreate() {
    setEditing(null);
    setForm(config.emptyForm);
    setErrors({});
    setBanner(null);
    setFormOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setForm(config.toForm(item));
    setErrors({});
    setBanner(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setErrors({});
  }

  function set<K extends keyof F>(key: K, value: F[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function upsert(saved: T) {
    setItems((list) => {
      const next = list ? [...list.filter((i) => i.id !== saved.id), saved] : [saved];
      return config.sort ? next.sort(config.sort) : next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBanner(null);
    const clientErrors = config.validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSaving(true);
    try {
      const request = config.toRequest(form);
      const saved = editing ? await config.update(editing.id, request) : await config.create(request);
      upsert(saved);
      setBanner({
        tone: "success",
        text: `${capitalize(noun)} ${config.itemLabel(saved)} ${editing ? "atualizad" : "criad"}${feminine ? "a" : "o"}.`,
      });
      closeForm();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.fields) {
        setErrors(err.fields);
      } else {
        setBanner({ tone: "danger", text: mensagemDeErro(err) });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: T) {
    setBanner(null);
    setDeletingId(item.id);
    try {
      await config.remove(item.id);
      setItems((list) => list?.filter((i) => i.id !== item.id) ?? null);
      if (editing?.id === item.id) closeForm();
      setBanner({
        tone: "success",
        text: `${capitalize(noun)} ${config.itemLabel(item)} excluíd${feminine ? "a" : "o"}.`,
      });
    } catch (err) {
      setBanner({ tone: "danger", text: mensagemDeErro(err) });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  if (loadError) {
    return (
      <ErrorState
        title={`Não foi possível carregar os registros`}
        message={loadError}
        onRetry={() => {
          setLoadError(null);
          setItems(null);
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {items === null ? "Carregando…" : `${items.length} registro${items.length === 1 ? "" : "s"}`}
        </p>
        {!formOpen && (
          <button type="button" onClick={openCreate} className={BUTTON_PRIMARY}>
            <Plus size={16} aria-hidden="true" />
            {feminine ? "Nova" : "Novo"} {noun}
          </button>
        )}
      </div>

      {banner && <FormBanner tone={banner.tone}>{banner.text}</FormBanner>}

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="animate-fade-up flex flex-col gap-4 rounded-[13px] border border-accent/30 bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">
              {editing ? `Editar ${noun} #${editing.id}` : `${feminine ? "Nova" : "Novo"} ${noun}`}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Fechar formulário"
              className="rounded-md p-1 text-dim transition-colors duration-150 hover:bg-hairline/8 hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {config.renderFields({ form, set, errors, disabled: saving })}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
              {saving ? "Salvando…" : editing ? "Salvar alterações" : "Criar"}
            </button>
            <button type="button" disabled={saving} onClick={closeForm} className={BUTTON_SECONDARY}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {items === null ? (
        <ListSkeleton rows={3} />
      ) : items.length === 0 ? (
        <p className="rounded-[13px] border border-dashed border-hairline/10 bg-card py-10 text-center text-sm text-faint">
          Nenhum registro ainda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[13px] border border-hairline/6 bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline/8 text-xs uppercase tracking-wide text-faint">
                <th scope="col" className="px-4 py-3 font-semibold">
                  ID
                </th>
                {config.columns.map((c) => (
                  <th key={c.header} scope="col" className={`px-4 py-3 font-semibold ${c.className ?? ""}`}>
                    {c.header}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-hairline/6 last:border-0 ${editing?.id === item.id ? "bg-accent/6" : ""}`}
                >
                  <td className="px-4 py-3 text-faint">{item.id}</td>
                  {config.columns.map((c) => (
                    <td key={c.header} className={`px-4 py-3 text-ink ${c.className ?? ""}`}>
                      {c.render(item)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {confirmId === item.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted">Excluir?</span>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item)}
                          className={`${BUTTON_DANGER} px-2 py-1 text-xs`}
                        >
                          {deletingId === item.id ? "Excluindo…" : "Sim, excluir"}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => setConfirmId(null)}
                          className={`${BUTTON_SECONDARY} px-2 py-1 text-xs`}
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={`Editar ${config.itemLabel(item)}`}
                          className="rounded-md p-1.5 text-dim transition-colors duration-150 hover:bg-hairline/8 hover:text-ink"
                        >
                          <PencilSimple size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBanner(null);
                            setConfirmId(item.id);
                          }}
                          aria-label={`Excluir ${config.itemLabel(item)}`}
                          className="rounded-md p-1.5 text-dim transition-colors duration-150 hover:bg-danger/10 hover:text-danger-text"
                        >
                          <Trash size={16} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
