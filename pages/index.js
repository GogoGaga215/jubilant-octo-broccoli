import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keyId, setKeyId] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setLink("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, keyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLink(data.link);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e0e0e0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        padding: 32,
        borderRadius: 16,
        background: "#111",
        border: "1px solid #222",
        boxShadow: "0 0 40px rgba(0,0,0,0.8)"
      }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 22, color: "#fff" }}>Platorelay Auto-Link</h1>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#888" }}>Platoboost Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid #333", background: "#0a0a0a", color: "#fff",
              fontSize: 14, outline: "none"
            }}
            placeholder="you@example.com" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#888" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid #333", background: "#0a0a0a", color: "#fff",
              fontSize: 14, outline: "none"
            }}
            placeholder="••••••••" />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#888" }}>Key ID</label>
          <input type="text" value={keyId} onChange={e => setKeyId(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid #333", background: "#0a0a0a", color: "#fff",
              fontSize: 14, outline: "none"
            }}
            placeholder="e.g. abc123" />
        </div>

        <button onClick={generate} disabled={loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 8,
            border: "none", background: loading ? "#333" : "#3b82f6",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}>
          {loading ? "Generating..." : "Generate Auth Link"}
        </button>

        {error && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#2a0a0a", color: "#ff6b6b", fontSize: 13 }}>
            {error}
          </div>
        )}

        {link && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#0a1a0a", border: "1px solid #1a3a1a" }}>
            <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 6 }}>Link generated:</div>
            <div style={{ fontSize: 13, wordBreak: "break-all", color: "#e0e0e0" }}>{link}</div>
            <button onClick={() => navigator.clipboard.writeText(link)}
              style={{
                marginTop: 8, padding: "6px 12px", borderRadius: 6,
                border: "1px solid #333", background: "#1a1a1a", color: "#ccc",
                fontSize: 12, cursor: "pointer"
              }}>
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
