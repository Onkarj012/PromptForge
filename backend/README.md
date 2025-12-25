# PromptForge Backend

AI-powered prompt refinement system using LangGraph for iterative improvement of prompts through Creator-Critic collaboration.

## Overview

PromptForge is a FastAPI-based backend that implements an agentic workflow for refining user prompts. It uses LangGraph to orchestrate a multi-agent system where a Creator agent generates improved prompts and a Critic agent evaluates them across multiple iterations.

## Features

- 🔄 **Iterative Refinement**: Configurable number of iterations for prompt improvement
- 🤖 **Multi-Agent Workflow**: Creator-Critic pattern using LangGraph
- 🔌 **OpenRouter Integration**: Support for multiple LLM providers (OpenAI, Anthropic, etc.)
- 💾 **PostgreSQL Database**: Persistent storage for runs and iterations
- 📊 **Structured Critique**: JSON-based evaluation with scores, strengths, weaknesses, and suggestions
- 🚀 **Async Architecture**: Built on FastAPI with async SQLAlchemy

## Architecture

```
backend/
├── app/
│   ├── agents/          # Agent system components
│   │   ├── graph.py     # LangGraph workflow definition
│   │   ├── state.py     # Agent state management
│   │   ├── llm.py       # LLM client configuration
│   │   └── tools.py     # Database persistence tools
│   ├── nodes/           # LangGraph node implementations
│   │   ├── creator.py   # Prompt creator node
│   │   ├── critic.py    # Prompt critic node
│   │   └── control.py   # Iteration control logic
│   ├── api/             # FastAPI endpoints
│   │   ├── agents.py    # Main refinement endpoint
│   │   └── health.py    # Health check
│   ├── db/              # Database layer
│   │   ├── models.py    # SQLAlchemy models
│   │   └── session.py   # Database session management
│   ├── core/            # Core utilities
│   │   └── logging.py   # Logging configuration
│   ├── config.py        # Application settings
│   └── main.py          # FastAPI application
└── scripts/
    └── test_db_connection.py
```

## Setup

### Prerequisites

- Python 3.13+
- PostgreSQL database
- OpenRouter API key

### Installation

1. **Clone the repository**:

   ```bash
   cd backend
   ```

2. **Install dependencies** (using `uv`):

   ```bash
   uv sync
   ```

3. **Configure environment variables**:
   Create a `.env` file:

   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/promptforge
   OPENROUTER_API_KEY=your_openrouter_api_key
   APP_NAME=PromptForge
   DEBUG=True
   API_V1_STR=/api/v1
   ENV=development
   ```

4. **Initialize the database**:

   ```bash
   uv run python -m app.db.init_db
   ```

5. **Start the server**:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

### Health Check

```http
GET /api/v1/health
```

**Response**:

```json
{
  "status": "ok"
}
```

### Refine Prompt

```http
POST /api/v1/prompt/refine
```

**Request Body**:

```json
{
  "prompt": "Your initial prompt",
  "mode": "creative",
  "creator_model": "openai/gpt-4o",
  "critic_model": "openai/gpt-4o",
  "iterations": 3
}
```

**Response**:

```json
{
  "run_id": "uuid",
  "final_prompt": "Improved prompt after iterations",
  "iterations": 3
}
```

## Usage Example

```bash
curl -X POST http://localhost:8000/api/v1/prompt/refine \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a story",
    "mode": "creative",
    "creator_model": "openai/gpt-3.5-turbo",
    "critic_model": "openai/gpt-3.5-turbo",
    "iterations": 3
  }'
```

## Database Schema

### Tables

- **`prompt_runs`**: Stores each refinement request
- **`prompt_iterations`**: Stores each iteration within a run
- **`prompt_memory`**: Stores prompt snapshots (future use)

See [Database Models](./app/db/models.py) for detailed schema.

## Agent System

The agent system uses LangGraph to create a cyclic workflow:

1. **Creator Node**: Generates improved prompts based on critique
2. **Critic Node**: Evaluates prompts and provides structured feedback
3. **Control Node**: Manages iteration counting and termination

See [AGENTS.md](./AGENTS.md) for detailed documentation.

## Development

### Run Tests

```bash
uv run pytest
```

### Database Connection Test

```bash
uv run python scripts/test_db_connection.py
```

### Code Structure

- Follow async/await patterns for all I/O operations
- Use Pydantic for request/response validation
- LangGraph handles workflow orchestration
- SQLAlchemy models define database schema

## Dependencies

Key dependencies (see `pyproject.toml` for full list):

- **FastAPI**: Web framework
- **LangGraph**: Agent workflow orchestration
- **LangChain**: LLM integration
- **SQLAlchemy**: Database ORM
- **Pydantic**: Data validation
- **asyncpg**: Async PostgreSQL driver

## Environment Variables

| Variable             | Description                          | Required |
| -------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`       | PostgreSQL connection string         | Yes      |
| `OPENROUTER_API_KEY` | OpenRouter API key                   | Yes      |
| `APP_NAME`           | Application name                     | No       |
| `DEBUG`              | Debug mode (True/False)              | No       |
| `API_V1_STR`         | API prefix                           | No       |
| `ENV`                | Environment (development/production) | No       |

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` format: `postgresql+asyncpg://user:pass@host:port/dbname`
- Check SSL parameters if using cloud databases

### API Errors

- Verify OpenRouter API key is valid
- Check model names are supported by OpenRouter
- Review server logs for detailed error messages

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
