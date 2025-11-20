import React from "react";
import { useEffect, useMemo, useState } from "react";

type JargonTerm = {
  word: string;
  reason: string;
  confidence: number;
};

type DetectResponse = {
  terms: JargonTerm[];
  overall_score: string;
  raw?: string;
} | null;

const API_BASE = import.meta.env.VITE_API_BASE;

export default function App() {
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("Executives");
  const [tone, setTone] = useState("Neutral");
  const [detectRes, setDetectRes] = useState<DetectResponse>(null);
  const [rewriteText, setRewriteText] = useState("");
  const [loadingDetect, setLoadingDetect] = useState(false);
  const [loadingRewrite, setLoadingRewrite] = useState(false);

  // Persistent session for Durable Object
  useEffect(() => {
    let existing = localStorage.getItem("linguashift-session");
    if (!existing) {
      existing = crypto.randomUUID();
      localStorage.setItem("linguashift-session", existing);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(existing);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function post(path: string, body: any) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function detect() {
    setLoadingDetect(true);
    setDetectRes(null);
    const data = await post("/api/detect", { message, sessionId });
    setDetectRes(data);
    setLoadingDetect(false);
  }

  async function rewrite() {
    setLoadingRewrite(true);
    const data = await post("/api/rewrite", {
      message,
      audience,
      tone,
      sessionId,
    });
    setRewriteText(data.rewritten);
    setLoadingRewrite(false);
  }

  const jargonWords = useMemo(() => {
    return detectRes?.terms?.map((t) => t.word.toLowerCase()) || [];
  }, [detectRes]);

  const highlighted = useMemo(() => {
    if (!detectRes) return message;

    return message.split(/(\s+)/).map((word, i) => {
      const clean = word.replace(/[.,!?]/g, "").toLowerCase();
      if (jargonWords.includes(clean)) {
        return (
          <span key={i} className="highlight">
            {word}
          </span>
        );
      }
      return <span key={i}>{word}</span>;
    });
  }, [message, jargonWords, detectRes]);

  return (
    <div className="app">
      <h1>LinguaShift - AI-Powered Corporate Messaging App 💬</h1>

      <textarea
        placeholder="Paste your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="controls">
        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option>Executives</option>
          <option>Product Managers</option>
          <option>Engineers</option>
          <option>Sales & GTM</option>
          <option>Non-technical stakeholders</option>
        </select>

        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option>Neutral</option>
          <option>Friendly</option>
          <option>Formal</option>
          <option>Very concise</option>
        </select>

        <button onClick={detect} disabled={loadingDetect}>
          {loadingDetect ? "Analyzing..." : "Detect Jargon"}
        </button>

        <button onClick={rewrite} disabled={loadingRewrite}>
          {loadingRewrite ? "Rewriting..." : "Rewrite Message"}
        </button>
      </div>

      <div className="columns">
        {/* JARGON PANEL */}
        <div className="panel">
          <h2>Jargon Detection</h2>

          {!detectRes ? (
            <p className="placeholder">
              Click “Detect Jargon” to highlight issues.
            </p>
          ) : (
            <>
              <p>
                Clarity:{" "}
                <span className={`badge ${detectRes.overall_score}`}>
                  {detectRes.overall_score}
                </span>
              </p>

              <p>{highlighted}</p>

              <ul>
                {detectRes?.terms?.map((t, i) => (
                  <li key={i}>
                    <strong>{t.word}</strong> — {t.reason} (
                    {Math.round(t.confidence * 100)}%)
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* REWRITE PANEL */}
        <div className="panel">
          <h2>Rewritten Message</h2>

          {rewriteText ? (
            <p className="rewrite">{rewriteText}</p>
          ) : (
            <p className="placeholder">Click “Rewrite Message”.</p>
          )}
        </div>
      </div>
    </div>
  );
}