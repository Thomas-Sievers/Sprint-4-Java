import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthLayout } from "./components/AuthLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PlaceholderPage titulo="Login" />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<PlaceholderPage titulo="Dashboard" />} />
        <Route path="/reunioes" element={<PlaceholderPage titulo="Reuniões" />} />
        <Route path="/reunioes/nova" element={<PlaceholderPage titulo="Nova Reunião" />} />
        <Route path="/reunioes/:reuniaoId" element={<PlaceholderPage titulo="Reunião" />} />
        <Route path="/validacao" element={<PlaceholderPage titulo="Validação" />} />
        <Route path="/cadastros" element={<PlaceholderPage titulo="Cadastros" />} />
        <Route path="/configuracoes" element={<PlaceholderPage titulo="Configurações" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
