"use client";

import { useEffect, useState } from "react";
import CommentsAdmin from "./content";

export default function AdminCommentsRoute() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const key = localStorage.getItem("admin_key");
    setApiKey(key);
    setChecking(false);
  }, []);

  if (checking) return null;
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-mutedc mb-4">Please log in first</p>
          <a href="/admin/login" className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-lg transition inline-block">Login →</a>
        </div>
      </div>
    );
  }
  return <CommentsAdmin apiKey={apiKey} />;
}
