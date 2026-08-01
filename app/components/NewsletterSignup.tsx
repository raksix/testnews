"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="mt-16 rounded-2xl border border-borderc bg-gradient-to-br from-red-950/30 via-surface2 to-surface2 p-8 md:p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-textc">Stay Informed</h3>
        <p className="text-mutedc mt-2 text-sm">
          Get the top stories delivered to your inbox every morning. No spam, unsubscribe anytime.
        </p>
        {submitted ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800">
            <p className="text-emerald-400 font-semibold text-sm">✓ You're subscribed! Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-surface border border-borderc rounded-xl px-4 py-3 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
        <p className="text-[11px] text-mutedc mt-3">Join 24,000+ readers worldwide</p>
      </div>
    </section>
  );
}
