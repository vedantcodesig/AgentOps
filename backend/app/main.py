from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import time

app = FastAPI(
    title="AgentOps API",
    description="Example API for AgentOps Studio",
    version="1.0.0",
)

# Allow CORS for development (frontend at localhost:3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hello")
async def hello():
    """
    Returns a friendly greeting.
    """
    return {"message": "Hello, world!"}


class EchoRequest(BaseModel):
    message: str = Field(..., description="Message to echo back")


@app.post("/api/echo")
async def echo(req: EchoRequest):
    """
    Echoes back the provided message.
    """
    return {"echo": req.message}


class AgentRunRequest(BaseModel):
    task: str = Field(..., description="Description of the task for the agent")
    max_steps: Optional[int] = Field(None, description="Maximum number of steps")


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


@app.post("/api/agent/run", response_model=AgentRunResult)
async def agent_run(req: AgentRunRequest):
    """
    Simulates running an agent for the given task.
    """
    if req.max_steps is not None and req.max_steps <= 0:
        raise HTTPException(status_code=400, detail="max_steps must be positive")

    max_steps = req.max_steps or 3
    steps: List[AgentStep] = []
    for i in range(1, max_steps + 1):
        # Simulate some latency
        start = time.perf_counter()
        # In a real implementation, call an LLM or tool here
        intermediate_output = f"step {i} processed {req.task}"
        latency_ms = (time.perf_counter() - start) * 1000
        steps.append(
            AgentStep(
                step=i,
                tool="demo_tool",
                input=req.task,
                output=intermediate_output,
                latency_ms=latency_ms,
            )
        )
    final_output = steps[-1].output if steps else f"completed {req.task}"
    return AgentRunResult(task=req.task, steps=steps, final_output=final_output)