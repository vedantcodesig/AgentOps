# AgentOps Studio

AgentOps Studio — Developer Console for Testing and Debugging AI Agent Workflows.

This project consists of a React/Next.js frontend and a Python/FastAPI backend that together create a developer playground for exploring API endpoints, generating code snippets, inspecting request/response payloads and simulating agent workflows.

## Features

- **Interactive API playground** with parameter inputs.
- **Request/response inspector** with JSON formatting.
- **Auto‑generated code snippets** in TypeScript (using `fetch`) and Python (using `requests`).
- **Authentication token input** and saved environment variables persisted in browser `localStorage`.
- **Example templates** for common requests.
- **Mini documentation pages** for each API endpoint.
- **SDK wrapper functions** in TypeScript for convenient consumption.
- **Simple agent simulation** endpoint demonstrating multi‑step agent runs.

## Project Structure

```
/agentops-studio/            # Next.js frontend
|-- README.md                # Project overview and setup instructions
|-- package.json             # Node dependencies and scripts
|-- tsconfig.json            # TypeScript compiler configuration
|-- tailwind.config.js       # Tailwind CSS configuration
|-- postcss.config.js        # PostCSS pipeline
|-- next.config.js           # Next.js runtime configuration
|-- next-env.d.ts            # Next.js type declarations
|-- src/
    |-- pages/
        |-- index.tsx        # Landing page with overview and links
        |-- api-explorer.tsx # Interactive API explorer UI
        |-- endpoint/
            |-- [slug].tsx   # Dynamic documentation page per endpoint
    |-- components/          # Reusable UI components
        |-- Layout.tsx
        |-- DocsSidebar.tsx
        |-- ApiExplorer.tsx
        |-- ApiRequestForm.tsx
        |-- CodeSnippet.tsx
        |-- ResponseViewer.tsx
    |-- lib/
        |-- endpoints.ts     # Endpoint metadata definitions
        |-- sdk.ts           # Generated SDK wrapper functions
        |-- utils.ts         # Utility functions for code generation
    |-- styles/
        |-- globals.css      # Global styles including Tailwind directives

/backend/                    # FastAPI backend
|-- README.md                # Backend setup and usage
|-- requirements.txt         # Python dependencies
|-- app/
    |-- __init__.py
    |-- main.py              # FastAPI application with endpoints
```

## Prerequisites

- **Node.js** (v18 or later) and npm or yarn
- **Python 3.10+**
- (Optional) **Postman** or `curl` for manual API testing

## Setup and Running

### Frontend

1. Navigate to the `agentops-studio` directory and install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

2. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at http://localhost:3000.

### Backend

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:

   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be served at http://localhost:8000. FastAPI automatically exposes API docs at http://localhost:8000/docs.

### Configuration

By default, the frontend expects the backend at `http://localhost:8000`. If you need to change this (for example, deploying the backend separately), update the `API_BASE_URL` constant in `src/lib/utils.ts`.

## Development Notes

- This is an **intermediate‑level project**. It uses functional React components and hooks (no class components).
- The UI is built with **Tailwind CSS** and minimal additional component libraries. Feel free to extend with your own UI library if desired.
- The SDK wrapper (`src/lib/sdk.ts`) demonstrates how to encapsulate API calls; you could publish this as an npm package in real projects.
- The agent simulation in `backend/app/main.py` is intentionally simple. Extend it to integrate with real agent frameworks or LLM APIs for more realistic scenarios.