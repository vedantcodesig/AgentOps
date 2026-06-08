# Backend (FastAPI)

This directory contains a simple FastAPI application that provides example endpoints used by the AgentOps Studio frontend.

## Endpoints

| Method | Path            | Description                                 |
|------- |---------------- |---------------------------------------------|
| GET    | `/api/hello`    | Returns a friendly greeting.                |
| POST   | `/api/echo`     | Echoes back the provided message.           |
| POST   | `/api/agent/run`| Simulates running an agent for a task.      |

FastAPI automatically documents the API at `/docs` and `/redoc`.

## Setup

Create and activate a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running the server

Run the application using Uvicorn (development server):

```bash
uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`. Adjust CORS configuration in `main.py` if you host the frontend on a different origin.