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
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-black text-textc mb-2">Access Denied</h1>
        <p className="text-sm text-mutedc mb-4">Please log in from the admin panel first.</p>
        <a href="/admin" className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition inline-block">Go to Admin Login →</a>
      </div>
    );
  }

  return <RedditBotContent apiKey={apiKey} />;
}
