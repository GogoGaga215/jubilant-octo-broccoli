import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [destUrl, setDestUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, destUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function copy() {
    if (!result?.url) return;
    const text = result.url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="wrap">
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="card">
        <div className="logo">
          <svg viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a6fff" />
                <stop offset="100%" stopColor="#8a4fff" />
              </linearGradient>
            </defs>
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" stroke="url(#g)" strokeWidth="3" fill="none" />
            <rect x="38" y="35" width="24" height="20" rx="3" stroke="url(#g)" strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="45" r="4" fill="url(#g)" />
            <line x1="50" y1="49" x2="50" y2="55" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1>Platorelay Auto</h1>
        <p className="sub">Dashboard automation — real signed links</p>

        <div className="field">
          <label>Platorelay Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>

        <div className="field">
          <label>Platorelay Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <div className="field">
          <label>Destination URL</label>
          <input type="text" value={destUrl} onChange={e => setDestUrl(e.target.value)} placeholder="https://example.com" />
        </div>

        <button className="gen" onClick={generate} disabled={loading}>
          {loading ? (
            <span className="spin">Generating...</span>
          ) : (
            'Generate Real Auth Link'
          )}
        </button>

        {error && <div className="err">{error}</div>}

        {result && (
          <div className="result">
            <div className="res-label">Generated Link</div>
            <div className="res-url">{result.url}</div>
            <button className="copy" onClick={copy}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <div className="meta">
              <span>Valid: {result.validFor || '24h'}</span>
              <span>Token: {result.tokenLength || 484} chars</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 20px;
          position: relative;
          overflow-x: hidden;
        }
        .orb {
          position: fixed;
          width: 400px; height: 400px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
        }
        .orb1 { background: #4a6fff; top: -150px; left: -150px; }
        .orb2 { background: #8a4fff; bottom: -150px; right: -150px; }
        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 560px;
          background: rgba(15,15,30,0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100,120,255,0.15);
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: 0 0 60px rgba(80,100,255,0.08);
        }
        .logo {
          width: 64px; height: 64px;
          margin: 0 auto 16px;
        }
        .logo svg { width: 100%; height: 100%; filter: drop-shadow(0 0 16px rgba(100,150,255,0.4)); }
        h1 {
          text-align: center;
          font-size: 26px;
          font-weight: 700;
          background: linear-gradient(135deg, #a0b0ff, #60a0ff, #c080ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
        }
        .sub {
          text-align: center;
          color: #6a7a9a;
          font-size: 13px;
          margin-bottom: 28px;
        }
        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6a7a9a;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .field input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(10,10,25,0.6);
          border: 1px solid rgba(100,120,255,0.2);
          border-radius: 12px;
          color: #e0e0ff;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
        }
        .field input:focus {
          border-color: rgba(100,150,255,0.5);
          box-shadow: 0 0 20px rgba(80,120,255,0.15);
        }
        .gen {
          width: 100%;
          padding: 15px;
          margin-top: 8px;
          background: linear-gradient(135deg, #4a6fff, #8a4fff);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.3s;
          box-shadow: 0 4px 30px rgba(80,100,255,0.3);
        }
        .gen:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(80,100,255,0.4); }
        .gen:active:not(:disabled) { transform: translateY(0); }
        .gen:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { display: inline-block; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .err {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(200,60,60,0.15);
          border: 1px solid rgba(200,60,60,0.3);
          border-radius: 10px;
          color: #e08080;
          font-size: 13px;
        }
        .result {
          margin-top: 24px;
          padding: 18px;
          background: rgba(10,10,25,0.6);
          border: 1px solid rgba(100,120,255,0.15);
          border-radius: 14px;
          animation: in 0.4s ease;
        }
        @keyframes in { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .res-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6a7a9a; margin-bottom: 8px; font-weight: 600; }
        .res-url { font-family: 'Courier New', monospace; font-size: 12px; color: #a0b0ff; word-break: break-all; line-height: 1.5; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(100,120,255,0.1); }
        .copy {
          margin-top: 12px;
          width: 100%;
          padding: 11px;
          background: rgba(100,150,255,0.15);
          border: 1px solid rgba(100,150,255,0.3);
          border-radius: 10px;
          color: #a0b0ff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .copy:hover { background: rgba(100,150,255,0.25); border-color: rgba(100,150,255,0.5); }
        .meta { display: flex; gap: 16px; margin-top: 12px; }
        .meta span { font-size: 11px; color: #6a7a9a; }
      `}</style>
    </div>
  );
}
