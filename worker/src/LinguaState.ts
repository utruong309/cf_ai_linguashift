import type {
	DurableObjectState,
	DurableObjectStorage,
  } from "@cloudflare/workers-types";

  export class LinguaState {
	state: DurableObjectState;
	storage: DurableObjectStorage;

	constructor(state: DurableObjectState) {
	  this.state = state;
	  this.storage = state.storage;
	}

	async fetch(request: Request): Promise<Response> {
	  const url = new URL(request.url);

	  // GET /glossary
	  if (url.pathname === "/glossary" && request.method === "GET") {
		const glossary = (await this.storage.get("glossary")) || [];
		return Response.json(glossary);
	  }

	  // POST /glossary
	  if (url.pathname === "/glossary" && request.method === "POST") {
		const body: any = await request.json(); // <-- FIXED: body is unknown
		await this.storage.put("glossary", body.glossary || []);
		return new Response(null, { status: 204 });
	  }

	  // GET /prefs
	  if (url.pathname === "/prefs" && request.method === "GET") {
		const prefs = (await this.storage.get("prefs")) || {};
		return Response.json(prefs);
	  }

	  // POST /prefs
	  if (url.pathname === "/prefs" && request.method === "POST") {
		const body: any = await request.json(); // <-- FIXED
		await this.storage.put("prefs", body || {});
		return new Response(null, { status: 204 });
	  }

	  return new Response("Not found", { status: 404 });
	}
  }