# PromptForge

An agentic multi-model prompt refinement tool. PromptForge uses a creator-critic architecture where one AI model generates optimized prompts while another evaluates and provides feedback, iterating until the prompt reaches a quality threshold.

## Architecture

- **Frontend**: Next.js 16 with React 19, TypeScript, and Tailwind CSS v4
- **Backend**: FastAPI with Python 3.11+, using OpenRouter for multi-model access

## Features

- Multi-model prompt refinement with configurable creator and critic models
- Support for models from OpenAI, Anthropic, Google, and DeepSeek via OpenRouter
- Iterative refinement with scoring, feedback, and improvement suggestions
- Domain-specific prompt optimization

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
uv sync
uv run python -m app.main
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:8000`.

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | API key for OpenRouter |
| `ENVIRONMENT` | `development` or `production` |
| `PORT` | Backend port (default: 8000) |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## API

- `POST /api/v1/refine/` - Refine a prompt
- `GET /health` - Health check

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Axios
- **Backend**: FastAPI, Pydantic, SQLAlchemy, ChromaDB, uvicorn
