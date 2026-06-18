import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * Returns { logout, loading } — handles navigation after sign-out.
 */
export function useLogout(redirectTo = "/login") {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate(redirectTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return { logout: handleLogout, loading };
}
