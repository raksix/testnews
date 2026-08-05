"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { API_URL } from "@/lib/api";

let sessionId = "";
function getSessionId() {
  if (sessionId) return sessionId;
  try {
    sessionId = localStorage.getItem("tn_sid") || "";
    if (!sessionId) {
      sessionId = (crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem("tn_sid", sessionId);
    }
  } catch {
    sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

export default function Tracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    // GDPR: only track if the user accepted the cookie consent
    let consent = "rejected";
    try { consent = localStorage.getItem("tn_consent") || "rejected"; } catch {}
    if (consent !== "accepted") return;
    const send = () => {
      const body = {
        path: pathname,
        referrer: first.current ? document.referrer : "",
        sessionId: getSessionId(),
      };
      first.current = false;
      try {
        navigator.sendBeacon(`${API_URL}/api/track`, new Blob([JSON.stringify(body)], { type: "application/json" }));
      } catch {
        fetch(`${API_URL}/api/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => {});
      }
    };
    // Small delay so it fires after hydration, skip admin pages
    if (!pathname.startsWith("/admin")) {
      const t = setTimeout(send, 1200);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return null;
}
