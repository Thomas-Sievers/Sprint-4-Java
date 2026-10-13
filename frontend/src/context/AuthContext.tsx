import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken, setUnauthorizedHandler } from "../lib/api";
import { definirTema, lerTemaSalvo } from "../lib/theme";
import type { Tema } from "../types/api";
import { AuthContext, type AuthContextValue } from "./useAuth";

const TOKEN_KEY = "noussight.token";
const USERNAME_KEY = "noussight.usuario";

interface Session {
  token: string;
  username: string;
}

function readStoredSession(): Session | null {
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const username = window.localStorage.getItem(USERNAME_KEY);
    return token && username ? { token, username } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(() => {
    const stored = readStoredSession();
    // Set before the first render so the first requests already carry the header.
    setAuthToken(stored?.token ?? null);
    return stored;
  });
  const [tema, setTemaState] = useState<Tema>(() => lerTemaSalvo());

  const login = useCallback((username: string, token: string) => {
    setAuthToken(token);
    setSession({ token, username });
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USERNAME_KEY, username);
    } catch {
      // localStorage indisponivel (modo privado, etc.) - sessao segue apenas em memoria
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setSession(null);
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USERNAME_KEY);
    } catch {
      // ignora
    }
  }, []);

  // Any 401 on a later request means the saved credentials stopped working.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  const setTema = useCallback((novoTema: Tema) => {
    setTemaState(novoTema);
    definirTema(novoTema);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      username: session?.username ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
      tema,
      setTema,
    }),
    [session, login, logout, tema, setTema],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
