"use client";

import { useEffect, useState } from "react";
import RedditBotContent from "./content";

export default function RedditBotPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("admin_key");
    setApiKey(key);
  }, []);

  if (!apiKey) {
    return (
      <div className="py-24 text-center">
        <p className="text-mutedc mb-4">Please log in first</p>
        <a href="/admin/login" className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition inline-block">Login →</a>
      </div>
    );
  }

  return <RedditBotContent apiKey={apiKey} />;
}
