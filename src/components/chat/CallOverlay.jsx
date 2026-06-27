import { useEffect, useRef } from "react";
import Avatar from "../shared/Avatar.jsx";

/**
 * Full-screen call overlay using Jitsi Meet External API (JS SDK).
 * Loads the Jitsi script dynamically — no npm package needed.
 * The JS API gives proper moderator rights and skips the waiting screen.
 */
export default function CallOverlay({
  callState, roomUrl, isVideo, callerName,
  otherUserName, otherUserAvatar, currentUserName,
  onAccept, onReject, onEnd,
}) {
  const containerRef = useRef(null);
  const apiRef       = useRef(null);

  /* ── Load Jitsi External API and start call when active ── */
  useEffect(() => {
    if (callState !== "active" || !roomUrl || !containerRef.current) return;

    // Extract room name from URL (last segment after meet.jit.si/)
    const roomName = roomUrl.split("/").pop();

    const loadJitsi = () => {
      if (apiRef.current) return; // already loaded

      // eslint-disable-next-line no-undef
      apiRef.current = new JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        width:      "100%",
        height:     "100%",
        userInfo:   { displayName: currentUserName || "Pulse User" },
        configOverwrite: {
          startWithAudioMuted:  false,
          startWithVideoMuted:  !isVideo,
          prejoinPageEnabled:   false,
          disableDeepLinking:   true,
          requireDisplayName:   false,
          enableWelcomePage:    false,
          enableClosePage:      false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK:   false,
          SHOW_BRAND_WATERMARK:   false,
          TOOLBAR_BUTTONS: ["microphone", "camera", "fullscreen", "hangup"],
        },
      });

      apiRef.current.addEventListener("readyToClose", () => onEnd?.());
      apiRef.current.addEventListener("videoConferenceLeft", () => onEnd?.());
    };

    // Dynamically load the Jitsi script if not already loaded
    if (window.JitsiMeetExternalAPI) {
      loadJitsi();
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = loadJitsi;
      document.head.appendChild(script);
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [callState, roomUrl, isVideo, currentUserName, onEnd]);

  if (callState === "idle") return null;

  const Wrapper = ({ children }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center
                    bg-surface-base animate-fade-in">
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none"/>
      <div className="relative z-10 flex flex-col items-center w-full h-full">
        {children}
      </div>
    </div>
  );

  /* ── Active call — Jitsi renders into containerRef ── */
  if (callState === "active") {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div ref={containerRef} className="flex-1 w-full"/>
        <div className="flex justify-center py-3 bg-gray-900 shrink-0">
          <button onClick={onEnd}
            className="flex items-center gap-2.5 rounded-full bg-red-500 px-8 py-3
                       text-sm font-semibold text-white hover:bg-red-600
                       transition-colors active:scale-95 shadow-lg">
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4
                       1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1
                       1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1
                       0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            End call
          </button>
        </div>
      </div>
    );
  }

  /* ── Call ended ── */
  if (callState === "ended") {
    return (
      <Wrapper>
        <div className="flex flex-col items-center gap-4 m-auto">
          <div className="flex size-20 items-center justify-center rounded-full
                          bg-surface-overlay border border-surface-border">
            <svg className="size-9 text-surface-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4
                       1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1
                       1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1
                       0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
          </div>
          <p className="text-lg font-semibold text-surface-primary">Call ended</p>
        </div>
      </Wrapper>
    );
  }

  /* ── Outgoing call ── */
  if (callState === "calling") {
    return (
      <Wrapper>
        <div className="flex flex-col items-center gap-6 m-auto px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping scale-125"/>
            <div className="absolute inset-0 rounded-full bg-brand-500/10 animate-ping scale-150"
                 style={{ animationDelay: "0.3s" }}/>
            <Avatar name={otherUserName} src={otherUserAvatar} size="xl"/>
          </div>
          <div className="space-y-1.5">
            <p className="text-xl font-semibold text-surface-primary">{otherUserName}</p>
            <p className="text-sm text-surface-muted animate-pulse">
              {isVideo ? "Video calling…" : "Calling…"}
            </p>
          </div>
          <button onClick={onEnd}
            className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3
                       text-sm font-semibold text-white hover:bg-red-600
                       transition-colors active:scale-95 mt-8">
            <svg className="size-5 rotate-135" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4
                       1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1
                       1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1
                       0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            Cancel
          </button>
        </div>
      </Wrapper>
    );
  }

  /* ── Incoming call ── */
  if (callState === "incoming") {
    return (
      <Wrapper>
        <div className="flex flex-col items-center gap-6 m-auto px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent-mint/20 animate-ping scale-125"/>
            <Avatar name={callerName} size="xl"/>
          </div>
          <div className="space-y-1.5">
            <p className="text-xl font-semibold text-surface-primary">{callerName}</p>
            <p className="text-sm text-surface-muted">
              Incoming {isVideo ? "video" : "voice"} call…
            </p>
          </div>
          <div className="flex items-center gap-12 mt-8">
            <div className="flex flex-col items-center gap-2">
              <button onClick={onReject}
                className="flex size-16 items-center justify-center rounded-full
                           bg-red-500 text-white hover:bg-red-600
                           transition-colors active:scale-95 shadow-lg">
                <svg className="size-7 rotate-135" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4
                           1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1
                           1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1
                           0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                </svg>
              </button>
              <span className="text-xs text-surface-muted">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={onAccept}
                className="flex size-16 items-center justify-center rounded-full
                           bg-accent-mint text-white hover:bg-emerald-500
                           transition-colors active:scale-95 shadow-lg">
                <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4
                           1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1
                           1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1
                           0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                </svg>
              </button>
              <span className="text-xs text-surface-muted">Accept</span>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  return null;
}
