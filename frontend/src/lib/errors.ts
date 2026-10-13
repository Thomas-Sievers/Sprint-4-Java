import { ApiError } from "./api";

/** Friendly message for any error thrown by the API client. */
export function mensagemDeErro(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Falha de conexão com a API. Verifique se ela está rodando e tente novamente.";
}
