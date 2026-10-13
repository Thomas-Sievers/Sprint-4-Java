import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthLayout } from "./components/AuthLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CadastrosPage } from "./pages/CadastrosPage";
import { ConfiguracoesPage } from "./pages/ConfiguracoesPage";
import { InsightsPage } from "./pages/InsightsPage";
import { LoginPage } from "./pages/LoginPage";
import { MeetingDetailPage } from "./pages/MeetingDetailPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { NovaReuniaoPage } from "./pages/NovaReuniaoPage";
import { BrandLoader } from "./components/BrandLoader";

// Recharts is big: the dashboard loads in its own chunk.
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense
              fallback={
                <div className="flex justify-center py-24">
                  <BrandLoader size={120} />
                </div>
              }
            >
              <DashboardPage />
            </Suspense>
          }
        />
        <Route path="/reunioes" element={<MeetingsPage />} />
        <Route path="/reunioes/nova" element={<NovaReuniaoPage />} />
        <Route path="/reunioes/:reuniaoId" element={<MeetingDetailPage />} />
        <Route path="/validacao" element={<InsightsPage />} />
        <Route path="/cadastros" element={<CadastrosPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
