import type { Tema } from "../types/api";

const STORAGE_KEY = "noussight.tema";

export function lerTemaSalvo(): Tema {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "claro" ? "claro" : "escuro";
  } catch {
    return "escuro";
  }
}

export function aplicarTemaNoDocumento(tema: Tema): void {
  document.documentElement.dataset.theme = tema === "claro" ? "light" : "dark";
}

export function salvarTemaLocal(tema: Tema): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, tema);
  } catch {
    // localStorage indisponivel (modo privado, etc.) - tema so vive em memoria nesta sessao
  }
}

export function definirTema(tema: Tema): void {
  aplicarTemaNoDocumento(tema);
  salvarTemaLocal(tema);
}
