import { createContext, useContext } from "react";
import type { Tema } from "../types/api";

export interface AuthContextValue {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  /** Saves the HTTP Basic token (base64 of "username:password") after the API accepted it. */
  login: (username: string, token: string) => void;
  logout: () => void;
  tema: Tema;
  setTema: (tema: Tema) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return ctx;
}
