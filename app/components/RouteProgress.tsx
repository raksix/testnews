"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "done";

export default function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<State>("idle");
  const prevPath = useRef(pathname);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = () => {
    setState("done");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 350);
  };

  // Start on any same-origin link click (captures all <a> tags)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setState("loading");
        }
      } catch {}
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  // Navigation completed → fill the bar and fade out
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      finish();
    }
  }, [pathname]);

  if (state === "idle") return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none route-progress ${
        state === "done" ? "route-done" : ""
      }`}
      aria-hidden
    >
      <div className="route-bar" />
    </div>
  );
}
