import { Info, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrandLoader } from "../components/BrandLoader";
import { useAuth } from "../context/AuthContext";
import { ApiError, checkCredentials, encodeBasicToken } from "../lib/api";
import { withViewTransition } from "../lib/viewTransition";

const REDIRECT_DELAY_MS = 650;

const INPUT_CLASS =
  "rounded-[10px] border border-hairline/10 bg-hairline/4 px-3 py-2 text-sm text-ink placeholder:text-dim outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    if (!redirecting) return;
    const timer = window.setTimeout(() => {
      withViewTransition(() => navigate(redirectTo, { replace: true }));
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [redirecting, navigate, redirectTo]);

  if (isAuthenticated && !redirecting) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const username = usuario.trim();
    if (!username || !senha) {
      setError("Informe usuário e senha.");
      return;
    }

    setIsSubmitting(true);
    const token = encodeBasicToken(username, senha);

    try {
      // The API has no login endpoint: an authenticated GET checks the credentials.
      await checkCredentials(token);
      login(username, token);
      setRedirecting(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Usuário ou senha inválidos." : err.message);
      } else {
        setError("Não foi possível conectar à API. Verifique se ela está rodando em localhost:8080.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (redirecting) {
    return (
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <BrandLoader size={160} />
        <p className="text-sm text-muted">Entrando…</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-sm animate-fade-up">
      <div className="mb-10 text-center">
        <h1 className="text-[52px] font-extrabold leading-none tracking-tight text-ink">
          Nous<span className="text-accent-text">Sight</span>
        </h1>
        <p className="mt-3 text-sm text-muted">Entre com seu usuário</p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[13px] border border-hairline/6 bg-card/75 p-6 backdrop-blur-[20px]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="usuario" className="text-sm font-medium text-muted">
              Usuário
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="aluno"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium text-muted">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className={INPUT_CLASS}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[10px] bg-danger-bg px-3 py-2 text-sm text-danger-text"
            >
              <WarningCircle size={18} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-accent-ink transition-colors duration-150 hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-muted">
        <Info size={16} aria-hidden="true" />
        Usuário de teste: <span className="font-semibold text-ink">aluno</span> /{" "}
        <span className="font-semibold text-ink">123456</span>
      </p>
    </div>
  );
}
