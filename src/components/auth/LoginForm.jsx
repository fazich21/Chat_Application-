import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { validateLoginForm } from "../../utils/validators.js";
import InputField from "../shared/InputField.jsx";
import Button from "../shared/Button.jsx";
import AlertBanner from "../shared/AlertBanner.jsx";

/* ── small eye-toggle icon ── */
function EyeIcon({ open, ...props }) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7
                   -1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7
                 a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                 l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
                 3.59m0 0A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025
                 10.025 0 01-4.132 5.411m0 0L21 21" />
      )}
    </svg>
  );
}

export default function LoginForm() {
  const { login, authError, clearAuthError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? "/chat";

  const [fields,    setFields]    = useState({ email: "", password: "" });
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    clearAuthError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLoginForm(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(fields);
      navigate(from, { replace: true });
    } catch {
      // authError is already set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AlertBanner
        type="error"
        message={authError}
        onDismiss={clearAuthError}
      />

      <InputField
        id="email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={fields.email}
        onChange={set("email")}
        error={errors.email}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      />

      <InputField
        id="password"
        label="Password"
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        autoComplete="current-password"
        value={fields.password}
        onChange={set("password")}
        error={errors.password}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2
                     2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       transition-colors focus:outline-none"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPass} className="size-4" />
          </button>
        }
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="rounded border-gray-300 text-brand-600
                                            focus:ring-brand-500 dark:border-gray-600
                                            dark:bg-gray-800" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-brand-600 hover:text-brand-700
                     dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-brand-600 hover:text-brand-700
                     dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
