import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { isValidEmail } from "../../utils/validators.js";
import InputField from "../shared/InputField.jsx";
import Button from "../shared/Button.jsx";
import AlertBanner from "../shared/AlertBanner.jsx";

export default function ForgotPasswordForm() {
  const { forgotPassword, authError, clearAuthError } = useAuth();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setError("Enter a valid email address."); return; }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // authError set in context
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full
                        bg-brand-100 dark:bg-brand-900/40">
          <svg className="size-7 text-brand-600 dark:text-brand-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reset link sent
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            If an account exists for{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>,
            you'll receive a password reset link shortly.....
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(""); }}>
          Send again
        </Button>
        <Link
          to="/login"
          className="block text-sm font-medium text-brand-600 hover:text-brand-700
                     dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AlertBanner type="error" message={authError} onDismiss={clearAuthError} />

      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        Enter the email address you used to create your account. We'll send you a
        link to reset your password.
      </p>

      <InputField
        id="forgot-email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); clearAuthError(); }}
        error={error}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      />

      <Button type="submit" loading={loading} className="w-full">
        Send reset link
      </Button>

      <Link
        to="/login"
        className="block text-center text-sm font-medium text-brand-600
                   hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300
                   transition-colors"
      >
        ← Back to sign in
      </Link>
    </form>
  );
}
