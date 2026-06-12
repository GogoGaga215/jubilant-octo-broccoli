import { useState } from "react";

export default function Home() {
  const [link, setLink] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function bypass() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.key);
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
        <h1 style={{ margin: "0 0 8px", fontSize: 22, color: "#fff" }}>Platorelay Bypass</h1>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#666" }}>Get the key directly — no browser needed</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#888" }}>Auth Link</label>
          <input type="text" value={link} onChange={e => setLink(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid #333", background: "#0a0a0a", color: "#fff",
              fontSize: 14, outline: "none"
            }}
            placeholder="https://auth.platorelay.com/a?d=..." />
        </div>

        <button onClick={bypass} disabled={loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 8,
            border: "none", background: loading ? "#333" : "#3b82f6",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}>
          {loading ? "Bypassing..." : "Get Key"}
        </button>

        {error && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#2a0a0a", color: "#ff6b6b", fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#0a1a0a", border: "1px solid #1a3a1a" }}>
            <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 6 }}>Key retrieved:</div>
            <div style={{ fontSize: 13, wordBreak: "break-all", color: "#e0e0e0", fontFamily: "monospace" }}>{result}</div>
            <button onClick={() => navigator.clipboard.writeText(result)}
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
                       
