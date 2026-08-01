"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

const inputCls = "w-full bg-surface2 border border-borderc rounded-lg px-4 py-3 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition";

export default function AdminLoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        localStorage.setItem("admin_key", key);
        window.location.href = "/admin";
      } else {
        setError("Invalid admin key");
      }
    } catch {
      setError("Connection failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white text-2xl mx-auto mb-4">T</div>
          <h1 className="text-2xl font-black text-textc">TestNews Admin</h1>
          <p className="text-mutedc text-sm mt-1">Enter your admin key to continue</p>
        </div>
        <form onSubmit={login} className="space-y-4">
          <input
            type="password"
            className={inputCls}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin key..."
            autoFocus
            required
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
