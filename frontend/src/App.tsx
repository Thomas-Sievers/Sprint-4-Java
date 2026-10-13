import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthLayout } from "./components/AuthLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { MeetingDetailPage } from "./pages/MeetingDetailPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { NovaReuniaoPage } from "./pages/NovaReuniaoPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

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
        <Route path="/dashboard" element={<PlaceholderPage titulo="Dashboard" />} />
        <Route path="/reunioes" element={<MeetingsPage />} />
        <Route path="/reunioes/nova" element={<NovaReuniaoPage />} />
        <Route path="/reunioes/:reuniaoId" element={<MeetingDetailPage />} />
        <Route path="/validacao" element={<PlaceholderPage titulo="Validação" />} />
        <Route path="/cadastros" element={<PlaceholderPage titulo="Cadastros" />} />
        <Route path="/configuracoes" element={<PlaceholderPage titulo="Configurações" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
