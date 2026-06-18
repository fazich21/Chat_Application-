import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * Convenience hook: returns { user, profile, isAuthenticated, loading }
 */
export function useSession() {
  const { user, profile, isAuthenticated, loading } = useAuth();
  return { user, profile, isAuthenticated, loading };
}
