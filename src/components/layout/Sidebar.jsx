import { useState, useRef, useEffect } from "react";
import Avatar from "../shared/Avatar.jsx";
import ConversationList from "../conversation/ConversationList.jsx";
import { SearchIcon, PlusIcon, UsersIcon, MessageIcon } from "../shared/icons.jsx";

export default function Sidebar({
  conversations = [],
  activeId,
  onSelect,
  currentUser = { name: "You", status: "online" },
  onNewChat,
  onNewGroup,
  onOpenSettings,
  onLogout,
  onToggleTheme,
  isDark = true,
  loading = false,
  error = null,
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = conversations.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    const matchesTab = tab === "all" ? true : tab === "groups" ? c.isGroup : !c.isGroup;
    return matchesQuery && matchesTab;
  });

  const pinned   = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  return (
    <aside className={`flex h-full w-full flex-col bg-surface-raised
                       border-r border-surface-border transition-colors duration-200 ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl
                          bg-gradient-bubble shadow-glow shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="size-4">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-surface-primary tracking-tight">Pulse</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex size-9 items-center justify-center rounded-xl
                       text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5
                       transition-colors duration-150"
          >
            {isDark ? (
              <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            ) : (
              <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            )}
          </button>
          {/* New chat / new group dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="flex size-9 items-center justify-center rounded-xl
                         text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5
                         transition-colors duration-150"
              aria-label="New conversation"
            >
              <PlusIcon className="size-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl
                              bg-surface-raised border border-surface-border shadow-glass
                              animate-pop-in overflow-hidden z-20">
                <button
                  onClick={() => { setMenuOpen(false); onNewChat?.(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm
                             text-surface-primary hover:bg-surface-overlay transition-colors"
                >
                  <MessageIcon className="size-4 text-surface-muted"/>
                  New chat
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onNewGroup?.(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm
                             text-surface-primary hover:bg-surface-overlay transition-colors
                             border-t border-surface-border"
                >
                  <UsersIcon className="size-4 text-surface-muted"/>
                  New group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2
                                  -translate-y-1/2 size-4 text-surface-muted"/>
          <input
            type="text"
            placeholder="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface-overlay
                       py-2.5 pl-9 pr-3 text-sm text-surface-primary placeholder:text-surface-muted
                       outline-none transition-all duration-150
                       focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 px-4 pb-2">
        {[
          { id: "all", label: "All", icon: MessageIcon },
          { id: "direct", label: "Direct", icon: null },
          { id: "groups", label: "Groups", icon: UsersIcon },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs
                        font-medium transition-all duration-150
                        ${tab === t.id
                          ? "bg-brand-50 dark:bg-white/[0.06] text-brand-600 dark:text-white"
                          : "text-surface-muted hover:text-surface-secondary hover:bg-black/5 dark:hover:bg-white/[0.03]"}`}
          >
            {t.icon && <t.icon className="size-3.5"/>}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Conversation list ── */}
      <div className="flex-1 overflow-y-auto scroll-dark px-2 pb-2">
        {loading ? (
          <div className="space-y-1 px-1 pt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <div className="size-12 rounded-full bg-surface-border"/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-surface-border"/>
                  <div className="h-2.5 w-1/2 rounded bg-surface-overlay"/>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-overlay">
              <SearchIcon className="size-5 text-surface-muted"/>
            </div>
            <p className="text-sm text-surface-muted">
              {query ? `No results for "${query}"` : "No conversations yet"}
            </p>
          </div>
        ) : (
          <>
            <ConversationList conversations={pinned} activeId={activeId} onSelect={onSelect}
                              label={pinned.length ? "Pinned" : null}/>
            <ConversationList conversations={unpinned} activeId={activeId} onSelect={onSelect}
                              label={pinned.length ? "All chats" : null}/>
          </>
        )}
      </div>

      {/* ── User footer ── */}
      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            className="flex flex-1 items-center gap-3 rounded-xl px-2 py-2
                       hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors min-w-0"
          >
            <Avatar name={currentUser.name} src={currentUser.avatarSrc} size="md" status={currentUser.status}/>
            <div className="flex-1 min-w-0 text-left">
              <p className="truncate text-sm font-medium text-surface-primary">{currentUser.name}</p>
              <p className="truncate text-xs text-surface-muted">
                {currentUser.status === "online" ? "Active now" : "Settings & profile"}
              </p>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl
                         text-surface-muted hover:bg-red-500/10 hover:text-red-500
                         transition-colors duration-150"
            >
              <svg className="size-[18px]" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
