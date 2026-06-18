import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Button from "../shared/Button.jsx";

/**
 * Drop-in logout button.
 * variant / className forwarded to <Button>.
 */
export default function LogoutButton({ variant = "ghost", className = "", children }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      loading={loading}
      onClick={handleLogout}
      icon={!loading ? ({ className: cn }) => (
        <svg className={cn} fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3
                   -3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ) : undefined}
    >
      {children ?? "Sign out"}
    </Button>
  );
}
