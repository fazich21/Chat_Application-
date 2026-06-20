import { useState, useEffect, useRef } from "react";
import { fetchGroupDetail, removeGroupMember, leaveGroup, updateGroup, addGroupMember } from "../../services/groupService.js";
import { db } from "../../services/supabase.js";
import Avatar from "../shared/Avatar.jsx";
import { XIcon, UsersIcon, SearchIcon } from "../shared/icons.jsx";

/**
 * Slide-in panel showing group details, member list, and admin actions.
 * Renders as an overlay on mobile, side panel on desktop.
 */
export default function GroupInfoPanel({ open, onClose, conversationId, currentUserId, onLeft }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const avatarFileRef = useRef(null);

  const reload = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGroupDetail(conversationId);
      setGroup(data);
      setNameInput(data.name ?? "");
    } catch (err) {
      setError(err.message ?? "Failed to load group.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) reload();
    else { setAddMode(false); setQuery(""); setEditingName(false); }
  }, [open, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!query.trim() || !group) { setResults([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const existingIds = group.members.map((m) => m.user_id);
      const { data } = await db("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${query.trim()}%`)
        .not("id", "in", `(${existingIds.join(",")})`)
        .limit(15);
      if (!cancelled) setResults(data ?? []);
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, group]);

  if (!open) return null;

  const myRole = group?.members.find((m) => m.user_id === currentUserId)?.role;
  const isAdmin = myRole === "admin";

  const handleAddMember = async (userId) => {
    try {
      await addGroupMember(conversationId, userId);
      setQuery("");
      setAddMode(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeGroupMember(conversationId, userId);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup(conversationId, currentUserId);
      onLeft?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput === group.name) { setEditingName(false); return; }
    try {
      await updateGroup(conversationId, { name: nameInput, updatedBy: currentUserId });
      setEditingName(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await updateGroup(conversationId, { avatarFile: file, updatedBy: currentUserId });
      reload();
    } catch (err) {
      setError(err.message);
    }
    e.target.value = "";
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"/>

      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-surface-raised
                        border-l border-surface-border shadow-glass
                        animate-slide-in-right flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="text-base font-semibold text-surface-primary">Group info</h2>
          <button onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg
                       text-surface-muted hover:bg-surface-overlay transition-colors">
            <XIcon className="size-4"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-dark">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-surface-border border-t-brand-500"/>
            </div>
          ) : error && !group ? (
            <p className="text-center text-sm text-red-500 py-12 px-5">{error}</p>
          ) : group ? (
            <>
              {/* Avatar + name */}
              <div className="flex flex-col items-center gap-3 px-5 py-6">
                <div className="relative">
                  <div className="size-24 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-900/30
                                  flex items-center justify-center ring-4 ring-brand-100 dark:ring-brand-900/40">
                    {group.avatar_url ? (
                      <img src={group.avatar_url} alt={group.name} className="size-full object-cover"/>
                    ) : (
                      <UsersIcon className="size-10 text-brand-400"/>
                    )}
                  </div>
                  {isAdmin && (
                    <button onClick={() => avatarFileRef.current?.click()}
                      className="absolute bottom-0 right-0 flex size-8 items-center justify-center
                                 rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-colors">
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07
                                 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012
                                 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                  )}
                  <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                </div>

                {editingName ? (
                  <div className="flex items-center gap-2 w-full px-4">
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className="input text-center"
                      maxLength={50}
                    />
                    <button onClick={handleSaveName}
                      className="shrink-0 text-sm font-medium text-brand-600">Save</button>
                  </div>
                ) : (
                  <button
                    onClick={() => isAdmin && setEditingName(true)}
                    className="text-lg font-semibold text-surface-primary text-center"
                  >
                    {group.name}
                    {isAdmin && <span className="ml-1.5 text-xs text-surface-muted">(edit)</span>}
                  </button>
                )}
                <p className="text-sm text-surface-muted">{group.members.length} members</p>
              </div>

              {error && (
                <p className="mx-5 mb-3 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Members header + add button */}
              <div className="flex items-center justify-between px-5 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-muted">
                  Members
                </p>
                {isAdmin && (
                  <button onClick={() => setAddMode((m) => !m)}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    {addMode ? "Cancel" : "+ Add"}
                  </button>
                )}
              </div>

              {/* Add member search */}
              {addMode && (
                <div className="px-5 pb-3 space-y-2">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2
                                            -translate-y-1/2 size-4 text-surface-muted"/>
                    <input
                      autoFocus
                      placeholder="Search username"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-xl border border-surface-border bg-surface-overlay
                                 py-2 pl-9 pr-3 text-sm text-surface-primary outline-none
                                 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  {results.map((u) => (
                    <button key={u.id} onClick={() => handleAddMember(u.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2
                                 hover:bg-surface-overlay transition-colors">
                      <Avatar name={u.username} src={u.avatar_url} size="sm"/>
                      <span className="text-sm text-surface-primary">{u.username}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Member list */}
              <div className="px-2 pb-4 space-y-0.5">
                {group.members.map((m) => (
                  <div key={m.user_id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-overlay transition-colors">
                    <Avatar name={m.profiles?.username ?? "?"} src={m.profiles?.avatar_url}
                            size="md" status={m.profiles?.presence_status}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-primary truncate">
                        {m.profiles?.username ?? "Unknown"}
                        {m.user_id === currentUserId && <span className="text-surface-muted"> (you)</span>}
                      </p>
                      {m.role === "admin" && (
                        <p className="text-xs text-brand-500">Admin</p>
                      )}
                    </div>
                    {isAdmin && m.user_id !== currentUserId && (
                      <button onClick={() => handleRemoveMember(m.user_id)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium shrink-0">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Leave group */}
              <div className="px-5 pb-6">
                <button onClick={handleLeave}
                  className="w-full rounded-xl border border-red-200 dark:border-red-900/50
                             bg-red-50 dark:bg-red-500/10 py-2.5 text-sm font-medium
                             text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20
                             transition-colors">
                  Leave group
                </button>
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
