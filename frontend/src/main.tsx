import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.tsx";
import { AppBoot } from "./components/AppBoot.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { aplicarTemaNoDocumento, lerTemaSalvo } from "./lib/theme.ts";
import "./index.css";

// Sincrono, antes do primeiro paint - evita flash do tema errado (ver lib/theme.ts).
aplicarTemaNoDocumento(lerTemaSalvo());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppBoot>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AppBoot>
  </StrictMode>,
);
