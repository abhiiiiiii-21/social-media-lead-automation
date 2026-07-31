# Social Media Lead Automation - Backend

This is the FastAPI backend for the Social Media Lead Automation project. It is designed to be a scalable, modular, and asynchronous backend.

## Project Setup

### Requirements

- Python 3.12+

### Installation

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```

## Running the Server

Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload
```

## Running Alembic

To create a new migration after updating models:
```bash
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations to the database:
```bash
alembic upgrade head
```

## Project Structure

- `app/api/`: API routes.
- `app/automation/`: Playwright automation scripts.
- `app/core/`: Configuration and settings.
- `app/database/`: Database connection and SQLAlchemy setup.
- `app/models/`: Database models.
- `app/schemas/`: Pydantic validation schemas.
- `app/services/`: Core business logic.
- `app/websocket/`: WebSocket connections and handlers.
- `app/utils/`: Utility functions.
- `app/templates/`: Email/HTML templates.
- `app/main.py`: FastAPI application initialization.

## Environment Variables

- `DATABASE_URL`: The SQLite database URL (e.g. `sqlite+aiosqlite:///./social_automation.db`)
- `GROQ_API_KEY_*`: API Keys for Groq LLM integration.
- `LOG_LEVEL`: Log severity (INFO, DEBUG, etc.)
- `PLAYWRIGHT_BROWSER`: Default browser to use for Playwright automation.
