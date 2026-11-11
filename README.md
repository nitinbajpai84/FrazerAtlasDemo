# Finance Atlas demo

Proposal demonstration of Finance Atlas: five Finance hubs, AskAtlas (Gemini agent with tools),
Atlas Recommends, document intake, reports and governance. All data is synthetic.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Turn on live AI (Gemini)

1. Copy `.env.example` to `.env.local`.
2. Put your Gemini API key after `GEMINI_API_KEY=`.
3. Restart `npm run dev`. The AskAtlas header shows "Live" with the model name.

The key stays on the dev server (see `vite.config.ts`); it is never sent to the browser.
Without a key, AskAtlas uses an offline planner that calls the same tools.

## Where things are

| Path | What it holds |
|---|---|
| `src/engine/data.ts` | Shared synthetic dataset, semantic layer, roles, documents |
| `src/engine/tools.ts` | Agent tools (with role-based access) and the Atlas Recommends rules |
| `src/engine/agent.ts` | Gemini function-calling loop, offline planner, evidence gate |
| `src/engine/store.tsx` | Role switching, decisions, reset |
| `src/components/engine/` | Hub building blocks, guided demo, live governance panels |
| `src/pages/` | Hubs and pages. Developer, Manager and Treasury read the shared dataset |
