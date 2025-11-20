import { LinguaState } from "./LinguaState";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export { LinguaState };

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        },
      });
    }

    //health check
    if (request.method === "GET" && url.pathname === "/") {
      return json({ status: "ok" });
    }

    if (request.method === "POST" && url.pathname === "/api/detect") {
      return handleDetect(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/rewrite") {
      return handleRewrite(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

//Durable Object helper
async function getState(env: any, sessionId: string) {
  const id = env.LINGUA_DO.idFromName(sessionId);
  return env.LINGUA_DO.get(id);
}

//POST /api/detect
async function handleDetect(request: Request, env: any): Promise<Response> {
  const body = (await request.json()) as {
    message?: string;
    sessionId?: string;
  };

  const message = body.message;
  const sessionId = body.sessionId;

  if (!message || !sessionId) {
    return json({ error: "message and sessionId are required" }, 400);
  }

  const state = await getState(env, sessionId);
  const glossaryRes = await state.fetch("https://dummy/glossary");
  const glossary = await glossaryRes.json();

  const prompt = `
You are a jargon detector.

Analyze this message and return ONLY valid JSON:

{
  "terms": [
    {"word": "string", "reason": "string", "confidence": 0.0}
  ],
  "overall_score": "Clear | Mixed | Heavy"
}

Message:
"${message}"

Glossary terms:
${JSON.stringify(glossary)}
`;

  const aiResult: any = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
    prompt,
    temperature: 0.3,
    max_tokens: 600,
  });

  const text = aiResult.response;

  try {
    return json(JSON.parse(text));
  } catch {
    return json({
      terms: [],
      overall_score: "Mixed",
      raw: text,
    });
  }
}

//POST /api/rewrite
async function handleRewrite(request: Request, env: any): Promise<Response> {
  const body = (await request.json()) as {
    message?: string;
    sessionId?: string;
    audience?: string;
    tone?: string;
  };

  const message = body.message;
  const sessionId = body.sessionId;
  const audience = body.audience || "non-technical stakeholders";
  const tone = body.tone || "neutral";

  if (!message || !sessionId) {
    return json({ error: "message and sessionId are required" }, 400);
  }

  const prompt = `
Rewrite this clearly for ${audience} in a ${tone} tone.
Remove jargon but keep meaning.

Return ONLY the rewritten message:

"${message}"
`;

  const aiResult: any = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
    prompt,
    temperature: 0.5,
    max_tokens: 400,
  });

  return json({ rewritten: aiResult.response });
}