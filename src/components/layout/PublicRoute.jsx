import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

/**
 * Wraps public auth pages.
 * Authenticated users → /chat
 * Still loading       → render nothing (prevents flash)
 */
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading)         return null;
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return <Outlet />;
}
