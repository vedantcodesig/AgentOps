import os
import time
import json
import uuid
import docker
import httpx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AgentOps API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://agent-ops-nsx1.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    docker_client = docker.from_env()
except Exception as e:
    docker_client = None

WORKSPACES_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "workspaces"))
os.makedirs(WORKSPACES_ROOT, exist_ok=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try: await connection.send_text(message)
            except: pass

manager = ConnectionManager()

@app.websocket("/ws/terminal")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class AgentRunRequest(BaseModel):
    task: str
    max_steps: Optional[int] = None

class AgentStep(BaseModel):
    step: int
    tool: str
    input: str
    output: str
    latency_ms: float

class AgentRunResult(BaseModel):
    task: str
    steps: List[AgentStep]
    final_output: str
    session_workspace: str

# ADDED THE SECURE FETCH TOOL
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "run_python_code",
            "description": "Execute Python code. You have a persistent filesystem at '/workspace'.",
            "parameters": {"type": "object", "properties": {"code": {"type": "string"}}, "required": ["code"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_bash_command",
            "description": "Execute a bash command in your persistent '/workspace'.",
            "parameters": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "secure_fetch",
            "description": "Fetch data from a public API or website. The backend safely proxies this request.",
            "parameters": {"type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]}
        }
    }
]

async def execute_python(code: str, workspace_dir: str) -> str:
    if not docker_client: return "Error: Sandbox offline."
    script_path = os.path.join(workspace_dir, "agent_script.py")
    with open(script_path, "w") as f: f.write(code)
    await manager.broadcast("\x1b[34m$ python agent_script.py\x1b[0m\n")
    try:
        container = docker_client.containers.run(
            image="python:3.10-alpine", command=["python", "/workspace/agent_script.py"],
            volumes={workspace_dir: {'bind': '/workspace', 'mode': 'rw'}}, working_dir="/workspace",
            detach=True, mem_limit="128m", network_disabled=True
        )
        output = []
        for chunk in container.logs(stream=True):
            text = chunk.decode('utf-8')
            output.append(text)
            await manager.broadcast(text)
        container.wait()
        container.remove()
        return "".join(output).strip() or "Script executed successfully with no output."
    except Exception as e:
        await manager.broadcast(f"\x1b[31mError: {str(e)}\x1b[0m\n")
        return f"Sandbox Error: {str(e)}"

async def execute_bash(command: str, workspace_dir: str) -> str:
    if not docker_client: return "Error: Sandbox offline."
    await manager.broadcast(f"\x1b[34m$ {command}\x1b[0m\n")
    try:
        container = docker_client.containers.run(
            image="alpine:latest", command=["sh", "-c", command],
            volumes={workspace_dir: {'bind': '/workspace', 'mode': 'rw'}}, working_dir="/workspace",
            detach=True, mem_limit="128m", network_disabled=True
        )
        output = []
        for chunk in container.logs(stream=True):
            text = chunk.decode('utf-8')
            output.append(text)
            await manager.broadcast(text)
        container.wait()
        container.remove()
        return "".join(output).strip() or "Command executed successfully with no output."
    except Exception as e:
        await manager.broadcast(f"\x1b[31mError: {str(e)}\x1b[0m\n")
        return f"Sandbox Error: {str(e)}"

# NEW: The Vault Proxy Executor
async def execute_secure_fetch(url: str) -> str:
    await manager.broadcast(f"\x1b[36m[PROXY] Fetching: {url}\x1b[0m\n")
    try:
        # In a real app, you would inject Authorization headers here based on the domain
        # e.g., if "api.github.com" in url: headers["Authorization"] = f"Bearer {os.getenv('GITHUB_TOKEN')}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            
            # Truncate massive responses so we don't blow up the LLM context window
            text_data = response.text
            if len(text_data) > 3000:
                text_data = text_data[:3000] + "\n...[TRUNCATED FOR CONTEXT SIZE]..."
                
            await manager.broadcast(f"\x1b[32m[PROXY] Success: {len(text_data)} bytes retrieved.\x1b[0m\n")
            return text_data
    except Exception as e:
        await manager.broadcast(f"\x1b[31m[PROXY Error]: {str(e)}\x1b[0m\n")
        return f"Proxy Error: {str(e)}"

@app.post("/api/agent/run", response_model=AgentRunResult)
async def agent_run(req: AgentRunRequest):
    max_steps = req.max_steps or 5
    steps = []
    session_id = str(uuid.uuid4())[:8]
    workspace_dir = os.path.join(WORKSPACES_ROOT, f"run_{session_id}")
    os.makedirs(workspace_dir, exist_ok=True)
    
    await manager.broadcast(f"\x1b[35m[Session Started: {session_id}]\x1b[0m\n")
    messages = [{"role": "system", "content": "You are an AI engineer. Use secure_fetch to get external data, then use run_python_code to process it and write it to your '/workspace'."}]
    messages.append({"role": "user", "content": req.task})

    for i in range(1, max_steps + 1):
        start = time.perf_counter()
        response = await client.chat.completions.create(model="gpt-3.5-turbo", messages=messages, tools=TOOLS, tool_choice="auto")
        latency_ms = (time.perf_counter() - start) * 1000
        message = response.choices[0].message
        
        if message.tool_calls:
            messages.append({"role": "assistant", "content": message.content, "tool_calls": [{"id": tc.id, "type": tc.type, "function": {"name": tc.function.name, "arguments": tc.function.arguments}} for tc in message.tool_calls]})
            
            for tc in message.tool_calls:
                args = json.loads(tc.function.arguments)
                tool_output = "Unknown tool"
                if tc.function.name == "run_python_code":
                    tool_output = await execute_python(args.get("code", ""), workspace_dir)
                elif tc.function.name == "run_bash_command":
                    tool_output = await execute_bash(args.get("command", ""), workspace_dir)
                elif tc.function.name == "secure_fetch":
                    tool_output = await execute_secure_fetch(args.get("url", ""))
                    
                steps.append(AgentStep(step=i, tool=tc.function.name, input=str(args), output=tool_output, latency_ms=latency_ms))
                messages.append({"role": "tool", "tool_call_id": tc.id, "name": tc.function.name, "content": tool_output})
        else:
            await manager.broadcast(f"\x1b[32m[Session Completed]\x1b[0m\n")
            return AgentRunResult(task=req.task, steps=steps, final_output=message.content or "Done", session_workspace=workspace_dir)

    await manager.broadcast(f"\x1b[33m[Max Steps Reached]\x1b[0m\n")
    return AgentRunResult(task=req.task, steps=steps, final_output="Max steps reached.", session_workspace=workspace_dir)

@app.get("/api/hello")
async def hello(): return {"message": "Hello, world!"}
@app.post("/api/echo")
async def echo(req: BaseModel): return {"echo": req.model_dump()}
