import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }     from "./contexts/AuthContext.jsx";
import { ThemeProvider }    from "./contexts/ThemeContext.jsx";
import ProtectedRoute       from "./components/layout/ProtectedRoute.jsx";
import PublicRoute          from "./components/layout/PublicRoute.jsx";
import { ErrorBoundary }    from "./components/shared/ErrorBoundary.jsx";

// Pages
import LoginPage            from "./pages/LoginPage.jsx";
import RegisterPage         from "./pages/RegisterPage.jsx";
import ForgotPasswordPage   from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage    from "./pages/ResetPasswordPage.jsx";
import ChatPage             from "./pages/ChatPage.jsx";
import SettingsPage         from "./pages/SettingsPage.jsx";
import ProfilePage          from "./pages/ProfilePage.jsx";
import NotFoundPage         from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />

              {/* Public */}
              <Route element={<PublicRoute />}>
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/register"        element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password"  element={<ResetPasswordPage />} />
              </Route>

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/chat"     element={<ChatPage />} />
                <Route path="/chat/:id" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile"  element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
