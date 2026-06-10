from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_agent_math_reasoning():
    # 1. Define the task
    payload = {
        "task": "What is 12 multiplied by 4? Please use the calculator.",
        "max_steps": 3
    }
    
    # 2. Send the request
    response = client.post("/api/agent/run", json=payload)
    
    # 3. Verify it succeeded
    assert response.status_code == 200
    data = response.json()
    
    # 4. Verify the agent actually reasoned and used the tool
    assert "steps" in data, "No steps returned"
    assert len(data["steps"]) > 0, "Agent didn't take any steps"
    
    first_step = data["steps"][0]
    assert first_step["tool"] == "calculate", f"Agent used wrong tool: {first_step['tool']}"
    
    print(f"\nSuccess! Agent reasoning:\n1. Input: {first_step['input']}\n2. Final Output: {data['final_output']}")
