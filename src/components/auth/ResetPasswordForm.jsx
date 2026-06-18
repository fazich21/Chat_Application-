import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { isValidPassword } from "../../utils/validators.js";
import { supabase } from "../../services/supabase.js";
import InputField from "../shared/InputField.jsx";
import Button from "../shared/Button.jsx";
import AlertBanner from "../shared/AlertBanner.jsx";

export default function ResetPasswordForm() {
  const { changePassword, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [validLink, setValidLink] = useState(false);

  /* Supabase sends the user to this page with a recovery session */
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setValidLink(true);
    });
    // Also check if we already have a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidLink(true);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isValidPassword(password)) errs.password = "Password must be at least 8 characters.";
    if (password !== confirm)        errs.confirm  = "Passwords do not match.";
    if (Object.keys(errs).length)   { setErrors(errs); return; }

    setLoading(true);
    try {
      await changePassword(password);
      setDone(true);
      setTimeout(() => navigate("/chat", { replace: true }), 2500);
    } catch {
      // authError set in context
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full
                        bg-emerald-100 dark:bg-emerald-900/40">
          <svg className="size-7 text-emerald-600 dark:text-emerald-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Password updated
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting you to the app…
          </p>
        </div>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="space-y-4 text-center">
        <AlertBanner type="error" message="This reset link is invalid or has expired." />
        <Button variant="outline" className="w-full" onClick={() => navigate("/forgot-password")}>
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AlertBanner type="error" message={authError} onDismiss={clearAuthError} />

      <InputField
        id="new-password"
        label="New password"
        type="password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: undefined })); }}
        error={errors.password}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2
                     2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      />

      <InputField
        id="confirm-new-password"
        label="Confirm new password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => { setConfirm(e.target.value); setErrors((er) => ({ ...er, confirm: undefined })); }}
        error={errors.confirm}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955
                     11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29
                     9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382
                     -3.016z" />
          </svg>
        )}
      />

      <Button type="submit" loading={loading} className="w-full">
        Set new password
      </Button>
    </form>
  );
}
