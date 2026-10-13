import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { definirTema, lerTemaSalvo } from "../lib/theme";
import type { Tema } from "../types/api";

const STORAGE_KEY = "noussight.token";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  tema: Tema;
  setTema: (tema: Tema) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => readStoredToken());
  const [tema, setTemaState] = useState<Tema>(() => lerTemaSalvo());

  const setToken = useCallback((next: string) => {
    setTokenState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage indisponivel (modo privado, etc.) - sessao segue apenas em memoria
    }
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }, []);

  const setTema = useCallback((novoTema: Tema) => {
    setTemaState(novoTema);
    definirTema(novoTema);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: token !== null,
      setToken,
      logout,
      tema,
      setTema,
    }),
    [token, setToken, logout, tema, setTema],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return ctx;
}
