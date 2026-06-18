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
    <div className="flex h-screen flex-col bg-surface-base">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-surface-border
                         bg-surface-raised/80 backdrop-blur-xl px-4 py-3">
        <button
          onClick={() => navigate("/chat")}
          className="flex size-9 items-center justify-center rounded-xl
                     text-gray-400 hover:bg-white/5 hover:text-white
                     transition-colors duration-150"
          aria-label="Back to chat"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <h1 className="text-base font-semibold text-white">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-dark px-4 py-6">
        <div className="mx-auto max-w-md space-y-6">

          {/* Profile card */}
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <Avatar name={profile?.username ?? "User"} src={profile?.avatar_url} size="xl" status="online" />
            <div className="min-w-0">
              <p className="text-base font-semibold text-white truncate">
                {profile?.username ?? "User"}
              </p>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass rounded-2xl divide-y divide-white/[0.06]">
            <button
              onClick={toggle}
              className="flex w-full items-center justify-between px-5 py-4
                         hover:bg-white/[0.02] transition-colors duration-150 rounded-t-2xl"
            >
              <span className="text-sm font-medium text-gray-200">Dark mode</span>
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full
                            transition-colors duration-200
                            ${isDark ? "bg-gradient-bubble" : "bg-gray-600"}`}
              >
                <span
                  className={`inline-block size-4.5 transform rounded-full bg-white
                              transition-transform duration-200
                              ${isDark ? "translate-x-6" : "translate-x-1"}`}
                />
              </span>
            </button>
          </div>

          {/* Account actions */}
          <div className="glass rounded-2xl p-2">
            <LogoutButton
              variant="ghost"
              className="w-full justify-start px-3 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              Sign out
            </LogoutButton>
          </div>

          <p className="text-center text-xs text-gray-600">Pulse — Chat application</p>
        </div>
      </div>
    </div>
  );
}
