import { Cpu, Flag, Package } from "@phosphor-icons/react";
import { CATEGORIA_LABELS } from "../lib/labels";
import type { TermCategory } from "../types/api";

// Same chip styles as the old ConcorrenteTag (neutral) and ProdutoTotvsTag (accent).
const STYLE: Record<TermCategory, string> = {
  COMPETITOR: "bg-hairline/6 text-muted",
  OWN_PRODUCT: "bg-accent/10 text-accent-text",
  TECHNOLOGY: "bg-accent-2/12 text-muted",
};

const ICON = { COMPETITOR: Flag, OWN_PRODUCT: Package, TECHNOLOGY: Cpu } as const;

export function TermTag({ keyword, category }: { keyword: string; category: TermCategory }) {
  const IconComponent = ICON[category];
  return (
    <span
      title={CATEGORIA_LABELS[category]}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STYLE[category]}`}
    >
      <IconComponent size={12} aria-hidden="true" />
      <span className="sr-only">{CATEGORIA_LABELS[category]}: </span>
      {keyword}
    </span>
  );
}
