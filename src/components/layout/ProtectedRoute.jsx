import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

/**
 * Wraps protected routes.
 * Unauthenticated → /login (with redirect-back state)
 * Bootstrapping   → full-screen spinner
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center
                      bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-12">
            <div className="absolute inset-0 rounded-full border-2
                            border-brand-200 dark:border-brand-900" />
            <div className="absolute inset-0 animate-spin rounded-full
                            border-2 border-transparent border-t-brand-600" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
