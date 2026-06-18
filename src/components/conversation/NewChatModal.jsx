import { useState, useEffect } from "react";
import { db } from "../../services/supabase.js";
import Avatar from "../shared/Avatar.jsx";
import { SearchIcon, XIcon } from "../shared/icons.jsx";

/**
 * Modal for starting a new direct conversation — searches the profiles table
 * by username and calls `onSelectUser(userId)` when a result is tapped.
 */
export default function NewChatModal({ open, onClose, onSelectUser, currentUserId }) {
  const [query, setQuery] = useState("");
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
        .select("id, username, avatar_url, presence_status")
        .ilike("username", `%${query.trim()}%`)
        .neq("id", currentUserId)
        .limit(20);
      if (!cancelled) {
        setResults(data ?? []);
        setLoading(false);
      }
    }, 300);

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [query, currentUserId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60
                    backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl glass-strong shadow-glass p-5 animate-pop-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">New conversation</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg
                       text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="relative mb-3">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2
                                  -translate-y-1/2 size-4 text-gray-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search by username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface-overlay
                       py-2.5 pl-9 pr-3 text-sm text-gray-200 placeholder:text-gray-500
                       outline-none focus:border-brand-500/50 focus:ring-2
                       focus:ring-brand-500/20 transition-all duration-150"
          />
        </div>

        <div className="max-h-72 overflow-y-auto scroll-dark space-y-1 -mx-1 px-1">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="size-5 animate-spin rounded-full border-2
                              border-white/10 border-t-brand-400" />
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              No users found for "{query}"
            </p>
          )}

          {!loading && results.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                         hover:bg-white/[0.04] transition-colors duration-150"
            >
              <Avatar name={user.username} src={user.avatar_url} size="md" status={user.presence_status} />
              <span className="text-sm font-medium text-gray-200">{user.username}</span>
            </button>
          ))}

          {!loading && !query.trim() && (
            <p className="py-6 text-center text-sm text-gray-500">
              Type a username to find someone to chat with
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
