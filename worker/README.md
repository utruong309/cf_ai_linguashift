# LinguaShift - AI-Powered Communication Assistant

LinguaShift is an AI-powered application built on Cloudflare that helps users detect and eliminate jargon from their communications, making messages clearer and more accessible to diverse audiences.

## Assignment Requirements Fulfilled

### 1. LLM (Large Language Model)
- **Implementation**: Uses `@cf/meta/llama-3.1-8b-instruct-fast` via Cloudflare Workers AI
- **Usage**:
  - Jargon detection with contextual analysis
  - Text rewriting with audience-specific customization
- **Location**: `src/index.ts` - `handleDetect()` and `handleRewrite()` functions

### 2. Workflow / Coordination
- **Implementation**: Cloudflare Workers for request handling and Durable Objects for state coordination
- **Architecture**:
  - **Workers**: Handle HTTP requests and coordinate with AI services (`src/index.ts`)
  - **Durable Objects**: Manage per-session state and glossary persistence (`src/LinguaState.ts`)
- **Location**: Worker entry point in `src/index.ts`, Durable Object class in `src/LinguaState.ts`

### 3. User Input via Chat or Voice
- **Implementation**: RESTful API endpoints designed for integration with Cloudflare Pages or Realtime
- **Endpoints**:
  - `POST /api/detect` - Analyze text for jargon
  - `POST /api/rewrite` - Rewrite text for specific audiences
  - `GET /` - Health check
- **Frontend Ready**: The Worker exposes CORS-enabled APIs that can be consumed by:
  - Cloudflare Pages (static frontend)
  - Cloudflare Realtime (real-time chat interface)
  - Any HTTP client

### 4. Memory or State
- **Implementation**: Durable Objects (`LinguaState`) provide persistent, per-session state management
- **Stored State**:
  - **Glossary**: Custom jargon terms per session for personalized detection
  - **Preferences**: User preferences (audience defaults, tone settings, etc.)
- **Location**: `src/LinguaState.ts` - State management using Durable Object storage
- **Persistence**: State persists across requests using Cloudflare's Durable Objects storage

## Architecture

```
┌─────────────────┐
│   Frontend      │  (Cloudflare Pages/Realtime)
│   (Chat UI)     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Cloudflare     │  ──→  POST /api/detect
│  Worker         │  ──→  POST /api/rewrite
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────┐
│Workers  │ │  Durable    │
│   AI    │ │  Objects    │
│         │ │ (LinguaState)│
└─────────┘ └─────────────┘
```

## Features

- **Jargon Detection**: AI-powered analysis to identify technical terms and jargon in messages
- **Smart Rewriting**: Automatically rewrite messages for different audiences (technical, non-technical, executives, etc.)
- **Customizable Tone**: Adjust rewriting tone (neutral, friendly, professional, etc.)
- **Persistent Glossary**: Store custom terms per session for personalized detection
- **Session Management**: Track user preferences and glossary per session using Durable Objects

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers AI enabled
- Wrangler CLI installed globally or via npm scripts

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd worker
```

2. Install dependencies:
```bash
npm install
```

3. Configure Wrangler (if not already configured):
```bash
npx wrangler login
```

### Development

Start the development server:
```bash
npm run dev
# or
npm start
```

The Worker will be available at `http://localhost:8787` (or the port shown in terminal).

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## API Reference

### POST /api/detect

Detects jargon in a message using AI analysis.

**Request Body**:
```json
{
  "message": "We need to refactor the codebase and optimize the API endpoints for better throughput.",
  "sessionId": "user-123"
}
```

**Response**:
```json
{
  "terms": [
    {
      "word": "refactor",
      "reason": "Technical jargon",
      "confidence": 0.9
    },
    {
      "word": "throughput",
      "reason": "Technical term",
      "confidence": 0.85
    }
  ],
  "overall_score": "Heavy"
}
```

### POST /api/rewrite

Rewrites a message for a specific audience and tone.

**Request Body**:
```json
{
  "message": "We need to refactor the codebase and optimize the API endpoints.",
  "sessionId": "user-123",
  "audience": "non-technical stakeholders",
  "tone": "professional"
}
```

**Response**:
```json
{
  "rewritten": "We need to reorganize our code system and improve the connection points to make it work better."
}
```

### Glossary Management (via Durable Object)

The Durable Object exposes endpoints for managing glossary terms:

- `GET https://dummy/glossary` - Retrieve glossary for a session
- `POST https://dummy/glossary` - Update glossary for a session

**Example Glossary Update**:
```javascript
const state = await getState(env, sessionId);
await state.fetch("https://dummy/glossary", {
  method: "POST",
  body: JSON.stringify({
    glossary: [
      { term: "API", definition: "Application Programming Interface" },
      { term: "Refactor", definition: "Restructure code" }
    ]
  })
});
```

## 🔧 Configuration

The project is configured via `wrangler.toml`:

```toml
name = "cf_ai_linguashift_worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[ai]
binding = "AI"

[durable_objects]
bindings = [
  { name = "LINGUA_DO", class_name = "LinguaState" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["LinguaState"]
```

## Testing

Run tests with Vitest:
```bash
npm test
```

## Technologies Used

- **Cloudflare Workers**: Serverless runtime for request handling
- **Cloudflare Workers AI**: LLM inference using Llama 3.1 8B Instruct Fast
- **Durable Objects**: Persistent state and session management
- **TypeScript**: Type-safe development
- **Vitest**: Testing framework with Cloudflare Workers support

## Environment Variables

No additional environment variables are required for basic functionality. The Workers AI binding is configured automatically through `wrangler.toml`.

## Notes

- The application uses session-based state management via Durable Objects
- Each `sessionId` maps to a unique Durable Object instance
- Glossary and preferences are persisted per session
- The Worker includes CORS headers for frontend integration

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)