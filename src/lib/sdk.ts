import { API_BASE_URL } from './utils';

/**
 * SDK wrapper for the sample API endpoints.
 * Each function makes an HTTP request to the corresponding endpoint and returns the parsed JSON response.
 */

/**
 * Fetch a greeting message.
 */
export async function hello() {
  const res = await fetch(`${API_BASE_URL}/api/hello`);
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

/**
 * Echo back a message.
 * @param message The message to echo
 */
export async function echo(message: string) {
  const res = await fetch(`${API_BASE_URL}/api/echo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

/**
 * Simulate an agent running a task.
 * @param task Description of the task
 * @param max_steps Optional maximum number of steps
 */
export async function agentRun(task: string, max_steps?: number) {
  const body: any = { task };
  if (max_steps !== undefined) body.max_steps = max_steps;
  const res = await fetch(`${API_BASE_URL}/api/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}