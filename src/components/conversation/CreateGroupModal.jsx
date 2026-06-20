import { useState, useEffect, useRef } from "react";
import { db } from "../../services/supabase.js";
import { createGroup } from "../../services/groupService.js";
import Avatar from "../shared/Avatar.jsx";
import { SearchIcon, XIcon, UsersIcon } from "../shared/icons.jsx";

/**
 * Two-step modal: 1) search & select members  2) name the group + avatar.
 * Calls onCreated(conversationId) when the group is successfully created.
 */
export default function CreateGroupModal({ open, onClose, onCreated, currentUserId }) {
  const [step, setStep] = useState(1); // 1 = pick members, 2 = name + avatar
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]); // [{id, username, avatar_url}]
  const [searching, setSearching] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStep(1); setQuery(""); setResults([]); setSelected([]);
      setGroupName(""); setAvatarFile(null); setAvatarPreview(null); setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await db("profiles")
        .select("id, username, avatar_url, presence_status")
        .ilike("username", `%${query.trim()}%`)
        .neq("id", currentUserId)
        .limit(20);
      if (!cancelled) { setResults(data ?? []); setSearching(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, currentUserId]);

  const toggleSelect = (user) => {
    setSelected((s) =>
      s.some((u) => u.id === user.id) ? s.filter((u) => u.id !== user.id) : [...s, user]
    );
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { setError("Group name is required."); return; }
    if (selected.length === 0) { setError("Add at least one member."); return; }

    setCreating(true);
    setError(null);
    try {
      const convId = await createGroup({
        name: groupName,
        avatarFile,
        memberIds: selected.map((u) => u.id),
        createdBy: currentUserId,
      });
      onCreated(convId);
    } catch (err) {
      setError(err.message ?? "Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-surface-raised border border-surface-border
                      shadow-glass animate-pop-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)}
                className="flex size-7 items-center justify-center rounded-lg
                           text-surface-muted hover:bg-surface-overlay transition-colors">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <h2 className="text-base font-semibold text-surface-primary">
              {step === 1 ? "New group" : "Group details"}
            </h2>
          </div>
          <button onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg
                       text-surface-muted hover:bg-surface-overlay transition-colors">
            <XIcon className="size-4"/>
          </button>
        </div>

        {/* Step 1 — select members */}
        {step === 1 && (
          <div className="p-5">
            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selected.map((u) => (
                  <span key={u.id}
                    className="flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30
                               pl-1 pr-2 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                    <Avatar name={u.username} src={u.avatar_url} size="sm"/>
                    {u.username}
                    <button onClick={() => toggleSelect(u)} className="hover:text-red-500">
                      <XIcon className="size-3"/>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative mb-3">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2
                                      -translate-y-1/2 size-4 text-surface-muted"/>
              <input
                autoFocus
                type="text"
                placeholder="Search by username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-overlay
                           py-2.5 pl-9 pr-3 text-sm text-surface-primary placeholder:text-surface-muted
                           outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="max-h-64 overflow-y-auto scroll-dark space-y-1">
              {searching && (
                <div className="flex justify-center py-6">
                  <div className="size-5 animate-spin rounded-full border-2
                                  border-surface-border border-t-brand-500"/>
                </div>
              )}
              {!searching && query.trim() && results.length === 0 && (
                <p className="py-6 text-center text-sm text-surface-muted">No users found</p>
              )}
              {!searching && results.map((user) => {
                const isSelected = selected.some((u) => u.id === user.id);
                return (
                  <button key={user.id} onClick={() => toggleSelect(user)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                                transition-colors ${isSelected ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-surface-overlay"}`}>
                    <Avatar name={user.username} src={user.avatar_url} size="md" status={user.presence_status}/>
                    <span className="flex-1 text-left text-sm font-medium text-surface-primary">
                      {user.username}
                    </span>
                    <div className={`flex size-5 items-center justify-center rounded-full border-2
                                     ${isSelected ? "bg-brand-600 border-brand-600" : "border-surface-border"}`}>
                      {isSelected && (
                        <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
              {!searching && !query.trim() && (
                <p className="py-6 text-center text-sm text-surface-muted">
                  Search for people to add to your group
                </p>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selected.length === 0}
              className="mt-4 w-full rounded-xl bg-gradient-bubble py-2.5 text-sm font-semibold
                         text-white shadow-glow transition-all active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next {selected.length > 0 && `(${selected.length})`}
            </button>
          </div>
        )}

        {/* Step 2 — name + avatar */}
        {step === 2 && (
          <div className="p-5 space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="size-20 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-900/30
                                flex items-center justify-center ring-4 ring-brand-100 dark:ring-brand-900/40">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Group" className="size-full object-cover"/>
                  ) : (
                    <UsersIcon className="size-8 text-brand-400"/>
                  )}
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 flex size-7 items-center justify-center
                             rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-colors">
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0
                             011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0
                             01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick}/>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-primary">Group name</label>
              <input
                type="text"
                autoFocus
                value={groupName}
                onChange={(e) => { setGroupName(e.target.value); setError(null); }}
                placeholder="e.g. Weekend Trip"
                maxLength={50}
                className="input"
              />
            </div>

            <p className="text-xs text-surface-muted">
              {selected.length} member{selected.length !== 1 ? "s" : ""} selected
            </p>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-xl bg-gradient-bubble py-2.5 text-sm font-semibold
                         text-white shadow-glow transition-all active:scale-[0.98]
                         disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {creating && (
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              )}
              {creating ? "Creating…" : "Create group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
