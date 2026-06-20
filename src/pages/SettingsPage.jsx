import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import LogoutButton from "../components/auth/LogoutButton.jsx";
import Avatar from "../components/shared/Avatar.jsx";
import { ArrowLeftIcon } from "../components/shared/icons.jsx";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { toggle, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col bg-surface-base transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-surface-border
                         bg-surface-raised px-4 py-3">
        <button onClick={() => navigate("/chat")}
          className="flex size-9 items-center justify-center rounded-xl
                     text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <ArrowLeftIcon className="size-5"/>
        </button>
        <h1 className="text-base font-semibold text-surface-primary">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto scroll-dark px-4 py-6">
        <div className="mx-auto max-w-md space-y-4">

          {/* Profile card — tappable to go to profile editor */}
          <button
            onClick={() => navigate("/profile")}
            className="w-full rounded-2xl border border-surface-border bg-surface-raised
                       p-5 flex items-center gap-4 hover:bg-surface-overlay
                       transition-colors duration-150 text-left"
          >
            <Avatar name={profile?.username ?? "User"} src={profile?.avatar_url} size="xl" status="online"/>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-surface-primary truncate">
                {profile?.username ?? "User"}
              </p>
              <p className="text-sm text-surface-muted truncate">{user?.email}</p>
              {profile?.bio && (
                <p className="text-xs text-surface-muted mt-1 truncate">{profile.bio}</p>
              )}
            </div>
            <svg className="size-5 text-surface-muted shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Preferences */}
          <div className="rounded-2xl border border-surface-border bg-surface-raised
                          divide-y divide-surface-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-surface-primary">Dark mode</p>
                <p className="text-xs text-surface-muted mt-0.5">
                  {isDark ? "Currently dark" : "Currently light"}
                </p>
              </div>
              <button
                onClick={toggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full
                            transition-colors duration-200
                            ${isDark ? "bg-brand-600" : "bg-gray-200"}`}
              >
                <span className={`inline-block size-4 transform rounded-full bg-white shadow
                                  transition-transform duration-200
                                  ${isDark ? "translate-x-6" : "translate-x-1"}`}/>
              </button>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-3 px-5 py-4
                         hover:bg-surface-overlay transition-colors text-left"
            >
              <svg className="size-5 text-surface-muted" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span className="text-sm font-medium text-surface-primary">Edit profile</span>
              <svg className="size-4 text-surface-muted ml-auto" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Sign out */}
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-2">
            <LogoutButton
              variant="ghost"
              className="w-full justify-start px-3 py-3 text-red-500
                         hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Sign out
            </LogoutButton>
          </div>

          <p className="text-center text-xs text-surface-muted">Pulse — Chat application</p>
        </div>
      </div>
    </div>
  );
}
