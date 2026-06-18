import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { validateRegisterForm } from "../../utils/validators.js";
import InputField from "../shared/InputField.jsx";
import Button from "../shared/Button.jsx";
import AlertBanner from "../shared/AlertBanner.jsx";

/* ── Password strength meter ── */
function strengthScore(p) {
  let s = 0;
  if (p.length >= 8)            s++;
  if (p.length >= 12)           s++;
  if (/[A-Z]/.test(p))          s++;
  if (/[0-9]/.test(p))          s++;
  if (/[^A-Za-z0-9]/.test(p))   s++;
  return s; // 0-5
}

const strengthLabel = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"];
const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = strengthScore(password);
  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? strengthColor[score] : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Strength: <span className="font-medium">{strengthLabel[score]}</span>
      </p>
    </div>
  );
}

export default function RegisterForm() {
  const { register, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [fields,   setFields]   = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done,     setDone]     = useState(false);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    clearAuthError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateRegisterForm(fields);
    if (fields.password !== fields.confirm) {
      errs.confirm = "Passwords do not match.";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({ email: fields.email, password: fields.password, username: fields.username });
      setDone(true);
    } catch {
      // authError set in context
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
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
            Check your inbox
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {fields.email}
            </span>
            . Click it to activate your account.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AlertBanner type="error" message={authError} onDismiss={clearAuthError} />

      <InputField
        id="username"
        label="Username"
        type="text"
        placeholder="your_handle"
        autoComplete="username"
        value={fields.username}
        onChange={set("username")}
        error={errors.username}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7
                     7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      />

      <InputField
        id="reg-email"
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

      <div>
        <InputField
          id="reg-password"
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
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
              aria-label="Toggle password"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1.8}>
                {showPass ? (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943
                             9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943
                             -9.542-7z" />
                  </>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943
                           -9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243
                           4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532
                           7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5
                           c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132
                           5.411m0 0L21 21" />
                )}
              </svg>
            </button>
          }
        />
        <PasswordStrength password={fields.password} />
      </div>

      <InputField
        id="confirm"
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        value={fields.confirm}
        onChange={set("confirm")}
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
        Create account
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-brand-600 hover:text-brand-700
                     dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
