import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;
export default function App() {
    const [sessionId, setSessionId] = useState("");
    const [message, setMessage] = useState("");
    const [audience, setAudience] = useState("Executives");
    const [tone, setTone] = useState("Neutral");
    const [detectRes, setDetectRes] = useState(null);
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
    async function post(path, body) {
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
        if (!detectRes)
            return message;
        return message.split(/(\s+)/).map((word, i) => {
            const clean = word.replace(/[.,!?]/g, "").toLowerCase();
            if (jargonWords.includes(clean)) {
                return (_jsx("span", { className: "highlight", children: word }, i));
            }
            return _jsx("span", { children: word }, i);
        });
    }, [message, jargonWords, detectRes]);
    return (_jsxs("div", { className: "app", children: [_jsx("h1", { children: "LinguaShift - AI-Powered Corporate Messaging App \uD83D\uDCAC" }), _jsx("textarea", { placeholder: "Paste your message here...", value: message, onChange: (e) => setMessage(e.target.value) }), _jsxs("div", { className: "controls", children: [_jsxs("select", { value: audience, onChange: (e) => setAudience(e.target.value), children: [_jsx("option", { children: "Executives" }), _jsx("option", { children: "Product Managers" }), _jsx("option", { children: "Engineers" }), _jsx("option", { children: "Sales & GTM" }), _jsx("option", { children: "Non-technical stakeholders" })] }), _jsxs("select", { value: tone, onChange: (e) => setTone(e.target.value), children: [_jsx("option", { children: "Neutral" }), _jsx("option", { children: "Friendly" }), _jsx("option", { children: "Formal" }), _jsx("option", { children: "Very concise" })] }), _jsx("button", { onClick: detect, disabled: loadingDetect, children: loadingDetect ? "Analyzing..." : "Detect Jargon" }), _jsx("button", { onClick: rewrite, disabled: loadingRewrite, children: loadingRewrite ? "Rewriting..." : "Rewrite Message" })] }), _jsxs("div", { className: "columns", children: [_jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Jargon Detection" }), !detectRes ? (_jsx("p", { className: "placeholder", children: "Click \u201CDetect Jargon\u201D to highlight issues." })) : (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Clarity:", " ", _jsx("span", { className: `badge ${detectRes.overall_score}`, children: detectRes.overall_score })] }), _jsx("p", { children: highlighted }), _jsx("ul", { children: detectRes?.terms?.map((t, i) => (_jsxs("li", { children: [_jsx("strong", { children: t.word }), " \u2014 ", t.reason, " (", Math.round(t.confidence * 100), "%)"] }, i))) })] }))] }), _jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Rewritten Message" }), rewriteText ? (_jsx("p", { className: "rewrite", children: rewriteText })) : (_jsx("p", { className: "placeholder", children: "Click \u201CRewrite Message\u201D." }))] })] })] }));
}
