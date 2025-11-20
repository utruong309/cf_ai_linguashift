LinguaShift

LinguaShift is an AI-powered messaging clarity tool built with Cloudflare Workers, Workers AI, Durable Objects, and a React frontend deployed on Cloudflare Pages. It analyzes written messages for jargon and provides clear rewrites adapted to specific audiences and tones.

It satisfies all requirements for Cloudflare’s Assignment:
(1) use of an LLM,
(2) workflow/coordination via Workers/Durable Objects,
(3) user input via a UI,
(4) memory/state.

1. Overview

LinguaShift helps users write clearer communication by:
- Detecting jargon, technical terms, and ambiguous phrases
- Assigning a clarity score
- Rewriting messages for specific audiences (Executives, PMs, Engineers, Sales, etc.)
- Adapting tone (neutral, formal, concise, friendly)
- Maintaining per-session state such as glossary information
- The system is implemented entirely on Cloudflare’s compute platform using Workers, Durable Objects, and Workers AI.