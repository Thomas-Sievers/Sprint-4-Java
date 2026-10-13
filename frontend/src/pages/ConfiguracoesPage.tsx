import { Moon, Sun, TextAa, TextT, type Icon } from "@phosphor-icons/react";
import { useState } from "react";
import { PageHeader } from "../components/States";
import { useAuth } from "../context/useAuth";
import { definirLeitura, lerLeituraSalva } from "../lib/theme";

function Segmented<T extends string | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon: Icon }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-2 gap-1 rounded-[10px] border border-hairline/10 bg-hairline/4 p-1"
    >
      {options.map((o) => {
        const ativo = o.value === value;
        const OptionIcon = o.icon;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
              ativo ? "bg-accent/14 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <OptionIcon size={16} aria-hidden="true" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ConfiguracoesPage() {
  const { tema, setTema, username } = useAuth();
  const [leitura, setLeitura] = useState(lerLeituraSalva);

  return (
    <>
      <PageHeader title="Configurações" description="Preferências de exibição, salvas apenas neste navegador." />

      <div className="flex max-w-lg flex-col gap-6 rounded-[13px] border border-hairline/6 bg-card p-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">Tema</span>
          <Segmented
            label="Tema"
            value={tema}
            onChange={setTema}
            options={[
              { value: "escuro", label: "Escuro", icon: Moon },
              { value: "claro", label: "Claro", icon: Sun },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">Leitura facilitada</span>
          <Segmented
            label="Leitura facilitada"
            value={leitura}
            onChange={(ativada) => {
              setLeitura(ativada);
              definirLeitura(ativada);
            }}
            options={[
              { value: false, label: "Desativada", icon: TextT },
              { value: true, label: "Ativada", icon: TextAa },
            ]}
          />
          <p className="text-xs text-dim">Aumenta o tamanho do texto e o espaçamento entre as linhas.</p>
        </div>

        <div className="border-t border-hairline/8 pt-4 text-sm text-muted">
          Conectado como <span className="font-semibold text-ink">{username}</span> na API{" "}
          <span className="font-mono text-xs text-faint">{import.meta.env.VITE_API_BASE_URL}</span>.
        </div>
      </div>
    </>
  );
}
