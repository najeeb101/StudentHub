"use client";

import { useEffect, useState } from "react";

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError("Could not load statistics"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background: "linear-gradient(135deg, #0f172a, #1d4ed8)", color: "#fff", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>StudentHub</span>
        </div>
        <a href="../pages/feed.html" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to Feed</a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Platform Statistics</h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Live data from the StudentHub database</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 16, padding: 24, color: "#b91c1c", fontSize: 15 }}>
            {error}
          </div>
        )}

        {!stats && !error && (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <div style={{ background: "#f3f4f6", height: 12, borderRadius: 6, width: "40%", marginBottom: 12 }} />
                <div style={{ background: "#f3f4f6", height: 48, borderRadius: 6, width: "30%", marginBottom: 8 }} />
                <div style={{ background: "#f3f4f6", height: 12, borderRadius: 6, width: "60%" }} />
              </div>
            ))}
          </>
        )}

        {stats && (
          <>
            {/* Total Users */}
            <StatCard label="Total Users" subtext="registered accounts on StudentHub">
              <BigNumber value={stats.totalUsers} max={stats.totalUsers} />
            </StatCard>

            {/* Avg Followers */}
            <StatCard label="Average Followers per User" subtext="followers on average across all users">
              <BigNumber value={stats.avgFollowers} max={20} />
            </StatCard>

            {/* Avg Posts */}
            <StatCard label="Average Posts per User" subtext="posts shared per user on average">
              <BigNumber value={stats.avgPosts} max={20} />
            </StatCard>

            {/* Most Liked Post */}
            <StatCard label="Most Liked Post">
              {stats.mostLikedPost ? (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar name={stats.mostLikedPost.author?.name} photo={stats.mostLikedPost.author?.photo} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{stats.mostLikedPost.author?.name}</span>
                      <span style={{ color: "#6b7280", fontSize: 13 }}>@{stats.mostLikedPost.author?.username}</span>
                    </div>
                    <div style={{ fontSize: 15, color: "#1f2937", lineHeight: 1.5, marginBottom: 12 }}>"{stats.mostLikedPost.text}"</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ color: "#ef4444", fontSize: 13 }}>❤️ {stats.mostLikedPost._count.likes} likes</span>
                        <span style={{ color: "#6b7280", fontSize: 13 }}>💬 {stats.mostLikedPost._count.comments} comments</span>
                      </div>
                      <a href="../pages/feed.html" style={linkBtnStyle}>View Post →</a>
                    </div>
                  </div>
                </div>
              ) : <EmptyState />}
            </StatCard>

            {/* Most Followed User */}
            <StatCard label="Most Followed User">
              {stats.mostFollowedUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Avatar name={stats.mostFollowedUser.name} photo={stats.mostFollowedUser.photo} size={56} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{stats.mostFollowedUser.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>@{stats.mostFollowedUser.username} · {stats.mostFollowedUser._count.followers} followers</div>
                  </div>
                  <a href={`../pages/profile.html?id=${stats.mostFollowedUser.id}`} style={linkBtnStyle}>View Profile →</a>
                </div>
              ) : <EmptyState />}
            </StatCard>

            {/* Avg Comments */}
            <StatCard label="Average Comments per Post" subtext="comments per post on average">
              <BigNumber value={stats.avgComments} max={10} />
            </StatCard>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, subtext, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 12 }}>{label}</div>
      {children}
      {subtext && <div style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>{subtext}</div>}
    </div>
  );
}

function BigNumber({ value, max }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <>
      <div style={{ fontSize: 48, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
      <div style={{ background: "#f3f4f6", height: 4, borderRadius: 2, marginTop: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #2563eb, #22c55e)", height: 4, borderRadius: 2, width: `${pct}%` }} />
      </div>
    </>
  );
}

function Avatar({ name, photo, size }) {
  if (photo) {
    return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #22c55e)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35 }}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function EmptyState() {
  return <div style={{ color: "#9ca3af", fontSize: 15 }}>No data yet</div>;
}

const linkBtnStyle = {
  color: "#2563eb",
  fontSize: 13,
  textDecoration: "none",
  fontWeight: 600,
  border: "1px solid #2563eb",
  padding: "4px 14px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};
