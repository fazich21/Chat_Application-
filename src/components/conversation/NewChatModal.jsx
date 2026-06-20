import { useState, useEffect } from "react";
import { db } from "../../services/supabase.js";
import Avatar from "../shared/Avatar.jsx";
import { SearchIcon, XIcon } from "../shared/icons.jsx";

export default function NewChatModal({ open, onClose, onSelectUser, currentUserId }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(async () => {
      const { data } = await db("profiles")
        .select("id, username, avatar_url, presence_status, bio")
        .ilike("username", `%${query.trim()}%`)
        .neq("id", currentUserId)
        .limit(20);
      if (!cancelled) { setResults(data ?? []); setLoading(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [query, currentUserId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-surface-raised border border-surface-border
                      shadow-glass p-5 animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-primary">New conversation</h2>
          <button onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg
                       text-surface-muted hover:bg-surface-overlay transition-colors">
            <XIcon className="size-4"/>
          </button>
        </div>

        {/* Search input */}
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
                       outline-none focus:border-brand-500/50 focus:ring-2
                       focus:ring-brand-500/20 transition-all"
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto scroll-dark space-y-1 -mx-1 px-1">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="size-5 animate-spin rounded-full border-2
                              border-surface-border border-t-brand-500"/>
            </div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <p className="py-6 text-center text-sm text-surface-muted">
              No users found for "{query}"
            </p>
          )}
          {!loading && results.map((user) => (
            <button key={user.id} onClick={() => onSelectUser(user.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                         hover:bg-surface-overlay transition-colors">
              <Avatar name={user.username} src={user.avatar_url} size="md"
                      status={user.presence_status}/>
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-surface-primary">{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-surface-muted truncate">{user.bio}</p>
                )}
              </div>
            </button>
          ))}
          {!loading && !query.trim() && (
            <p className="py-6 text-center text-sm text-surface-muted">
              Type a username to search
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
