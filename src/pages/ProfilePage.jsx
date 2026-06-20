import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { updateProfile, uploadAvatar } from "../services/profileService.js";
import Avatar from "../components/shared/Avatar.jsx";
import AlertBanner from "../components/shared/AlertBanner.jsx";
import { ArrowLeftIcon } from "../components/shared/icons.jsx";

const AVAILABLE_HOURS_OPTIONS = [
  "Always available",
  "Weekdays 9am–5pm",
  "Weekdays 9am–9pm",
  "Evenings only (6pm–10pm)",
  "Weekends only",
  "Mornings only (6am–12pm)",
  "Not available",
  "Custom",
];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [fields, setFields] = useState({
    username:        profile?.username        ?? "",
    status_message:  profile?.status_message  ?? "",
    bio:             profile?.bio             ?? "",
    available_hours: profile?.available_hours ?? "Always available",
    customHours:     "",
  });
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(false);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed."); return; }
    if (file.size > 3 * 1024 * 1024)    { setError("Avatar must be smaller than 3MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fields.username.trim()) { setError("Username cannot be empty."); return; }

    setSaving(true);
    setError(null);
    try {
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id);
      }

      const hoursValue = fields.available_hours === "Custom"
        ? fields.customHours.trim() || "Custom"
        : fields.available_hours;

      await updateProfile(user.id, {
        username:        fields.username.trim(),
        status_message:  fields.status_message.trim(),
        bio:             fields.bio.trim(),
        available_hours: hoursValue,
        avatar_url:      avatarUrl,
      });

      await refreshProfile();
      setAvatarFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-base font-semibold text-surface-primary">Edit Profile</h1>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scroll-dark">
        <form onSubmit={handleSave} className="mx-auto max-w-lg px-4 py-8 space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="size-24 rounded-full overflow-hidden ring-4 ring-brand-100
                              dark:ring-brand-900/40 shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="size-full object-cover"/>
                ) : (
                  <Avatar name={fields.username || "?"} size="xl"/>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center
                           rounded-full bg-brand-600 text-white shadow-md
                           hover:bg-brand-700 transition-colors"
                aria-label="Change avatar"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0
                           0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07
                           7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                     className="hidden" onChange={handleAvatarChange}/>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-surface-primary">{profile?.username}</p>
              <p className="text-xs text-surface-muted">{user?.email}</p>
            </div>
          </div>

          {/* Feedback banners */}
          <AlertBanner type="error"   message={error}   onDismiss={() => setError(null)}/>
          <AlertBanner type="success" message={success ? "Profile saved successfully!" : null}/>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-primary">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fields.username}
              onChange={set("username")}
              placeholder="your_handle"
              maxLength={30}
              className="input"
            />
            <p className="text-xs text-surface-muted">{fields.username.length}/30 characters</p>
          </div>

          {/* Status message */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-primary">
              Status message
            </label>
            <input
              type="text"
              value={fields.status_message}
              onChange={set("status_message")}
              placeholder="What's on your mind?"
              maxLength={100}
              className="input"
            />
            <p className="text-xs text-surface-muted">
              Shown next to your avatar. {fields.status_message.length}/100
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-primary">Bio</label>
            <textarea
              value={fields.bio}
              onChange={set("bio")}
              placeholder="Tell people a little about yourself…"
              rows={4}
              maxLength={300}
              className="input resize-none scroll-dark"
            />
            <p className="text-xs text-surface-muted">{fields.bio.length}/300 characters</p>
          </div>

          {/* Available hours */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-primary">
              Available hours
            </label>
            <p className="text-xs text-surface-muted mb-2">
              Let others know when you're typically reachable.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_HOURS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFields((f) => ({ ...f, available_hours: opt }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium text-left
                              transition-all duration-150
                              ${fields.available_hours === opt
                                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300"
                                : "border-surface-border bg-surface-overlay text-surface-secondary hover:border-brand-300"}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {fields.available_hours === "Custom" && (
              <input
                type="text"
                value={fields.customHours}
                onChange={set("customHours")}
                placeholder="e.g. Mon–Fri 10am–3pm"
                className="input mt-2"
              />
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-primary">Email</label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="input opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-surface-muted">Email cannot be changed here.</p>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-bubble py-3 text-sm font-semibold
                       text-white shadow-glow transition-all active:scale-[0.98]
                       disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            )}
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
