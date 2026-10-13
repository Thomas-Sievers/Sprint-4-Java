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

// "Leitura facilitada": larger text and line spacing (see index.css), saved only in this browser.
const LEITURA_KEY = "noussight.leituraFacilitada";

export function lerLeituraSalva(): boolean {
  try {
    return window.localStorage.getItem(LEITURA_KEY) === "1";
  } catch {
    return false;
  }
}

export function aplicarLeituraNoDocumento(ativada: boolean): void {
  if (ativada) document.documentElement.dataset.leitura = "facilitada";
  else delete document.documentElement.dataset.leitura;
}

export function definirLeitura(ativada: boolean): void {
  aplicarLeituraNoDocumento(ativada);
  try {
    window.localStorage.setItem(LEITURA_KEY, ativada ? "1" : "0");
  } catch {
    // localStorage indisponivel - preferencia so vale nesta sessao
  }
}
