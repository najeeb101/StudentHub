"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const currentUserKey = "sh_currentUser";

    try {
      const localUser = localStorage.getItem(currentUserKey);
      const sessionUser = sessionStorage.getItem(currentUserKey);
      window.location.replace(localUser || sessionUser ? "/pages/feed.html" : "/pages/login.html");
    } catch {
      window.location.replace("/pages/login.html");
    }
  }, []);

  return (
    <main
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        height: "100vh",
        justifyContent: "center",
        margin: 0,
      }}
    >
      <img
        alt="StudentHub Logo"
        src="/media/StudentHub-logo.png"
        style={{
          filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3))",
          height: 220,
          marginBottom: 24,
          objectFit: "contain",
          width: 220,
        }}
      />
      <div style={{ fontSize: 18, fontWeight: 500 }}>Loading StudentHub...</div>
    </main>
  );
}
