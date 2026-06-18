// ── App ───────────────────────────────────────────────────────────────────────
export const APP_NAME        = import.meta.env.VITE_APP_NAME ?? "Pulse";
export const APP_URL         = import.meta.env.VITE_APP_URL  ?? "http://localhost:5173";

// ── Supabase ──────────────────────────────────────────────────────────────────
export const STORAGE_BUCKET  = import.meta.env.VITE_STORAGE_BUCKET  ?? "chat-images";
export const MAX_IMAGE_SIZE  = Number(import.meta.env.VITE_MAX_IMAGE_SIZE ?? 5_242_880);

// ── Feature flags ─────────────────────────────────────────────────────────────
export const ENABLE_IMAGE_UPLOAD = import.meta.env.VITE_ENABLE_IMAGE_UPLOAD !== "false";
export const ENABLE_GROUP_CHAT   = import.meta.env.VITE_ENABLE_GROUP_CHAT   !== "false";

// ── Realtime ──────────────────────────────────────────────────────────────────
export const TYPING_DEBOUNCE_MS  = 300;
export const TYPING_TIMEOUT_MS   = 3_000;
export const MESSAGES_PAGE_SIZE  = 40;

// ── Conversation types ────────────────────────────────────────────────────────
export const CONV_TYPE_DIRECT = "direct";
export const CONV_TYPE_GROUP  = "group";

// ── Member roles ──────────────────────────────────────────────────────────────
export const ROLE_ADMIN  = "admin";
export const ROLE_MEMBER = "member";

// ── Message content types ─────────────────────────────────────────────────────
export const MSG_TYPE_TEXT   = "text";
export const MSG_TYPE_IMAGE  = "image";
export const MSG_TYPE_SYSTEM = "system";

// ── Presence statuses ─────────────────────────────────────────────────────────
export const PRESENCE_ONLINE  = "online";
export const PRESENCE_AWAY    = "away";
export const PRESENCE_OFFLINE = "offline";

// ── Routes ────────────────────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN:    "/login",
  REGISTER: "/register",
  RESET_PW: "/reset-password",
  CHAT:     "/chat",
  CONV:     "/chat/:id",
  GROUPS:   "/groups",
  SETTINGS: "/settings",
};
