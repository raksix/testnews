"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("tn_consent")) setVisible(true);
    } catch {}
  }, []);

  const decide = (v: "accepted" | "rejected") => {
    try {
      localStorage.setItem("tn_consent", v);
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] bg-[#0f172a]/95 backdrop-blur border-t border-white/10 shadow-2xl">
      <div className="mx-auto max-w-[1320px] px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-[13px] leading-relaxed text-white/80">
          <p className="font-bold text-white text-sm mb-0.5">🍪 We value your privacy</p>
          <p>
            We use cookies to personalize content, analyze traffic and improve your experience.
            You can accept or decline — declining still lets you browse, we just won&apos;t collect analytics.
            Read our{" "}
            <Link href="/privacy" className="underline text-white hover:text-red-400 transition">Privacy Policy</Link>,{" "}
            <Link href="/terms" className="underline text-white hover:text-red-400 transition">Terms of Service</Link> and{" "}
            <Link href="/cookies" className="underline text-white hover:text-red-400 transition">Cookie Policy</Link>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            onClick={() => decide("rejected")}
            className="text-[13px] font-semibold px-4 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition sm:py-2"
          >
            Decline
          </button>
          <button
            onClick={() => decide("accepted")}
            className="text-[13px] font-bold px-5 py-2.5 rounded-lg bg-brand text-white hover:bg-brand/90 transition sm:py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
