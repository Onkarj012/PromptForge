# PromptForge

PromptForge is an agentic prompt refinement platform with a Next.js frontend and a FastAPI + LangGraph backend. It runs a creator/critic loop against OpenRouter models, stores runs in Postgres, and presents a modern studio UI for refining prompts.

## What’s Inside

- **Frontend**: Next.js app (Tailwind + Base UI)
- **Backend**: FastAPI + LangGraph + SQLAlchemy (async)
- **LLM**: OpenRouter via `langchain-openai`
- **DB**: PostgreSQL (asyncpg)

```
PromptForge/
├── frontend/
└── backend/
```

## Quick Start (Local)

### 1) Backend

Prereqs: **Python 3.13+**, Postgres, OpenRouter API key

```bash
cd backend
uv sync
```

Create `.env` in `backend/`:

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
OPENROUTER_API_KEY=your_openrouter_key
ENV=development
DEBUG=True
```

Run the API:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

Notes:
- On startup (in development), the backend will auto-create tables.
- If you run the backend from the repo root, it still finds `backend/.env`.

### 2) Frontend

Prereqs: Node 18+ (or Bun/PNPM)

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Run the UI:

```bash
npm run dev
```

Open: http://localhost:3000

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres async URL (`postgresql+asyncpg://...`) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `ENV` | No | `development` or `production` |
| `DEBUG` | No | `True/False` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE` | Yes | Backend URL (e.g., `http://localhost:8000`) |

## Model Support

The frontend sends `creator_model` and `critic_model` directly to the backend. The backend forwards them to OpenRouter **without validation**.

If a model ID isn’t supported by OpenRouter, the request will fail. Consider adding a backend `/models` endpoint or a validation list if you want guardrails.

## Troubleshooting

- **DB errors**: confirm `DATABASE_URL` uses the `postgresql+asyncpg://` scheme.
- **CORS**: backend allows all origins in development by default.
- **Model errors**: ensure the model name exists on OpenRouter.

---

If you want a single-command dev runner (frontend + backend), I can add one.
