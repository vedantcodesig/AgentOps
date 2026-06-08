import { EndpointDefinition } from './endpoints';

// Base URL for the API. Override by setting NEXT_PUBLIC_API_BASE_URL in the environment.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Generate a TypeScript `fetch` code snippet for the given endpoint.
 * @param endpoint Endpoint definition
 * @param body Body parameters
 * @param token Optional bearer token
 */
export function generateTypeScriptSnippet(endpoint: EndpointDefinition, body: any, token?: string): string {
  const url = `${API_BASE_URL}${endpoint.path}`;
  const headers: string[] = ['"Content-Type": "application/json"'];
  if (token) headers.push(`"Authorization": "Bearer ${token}"`);
  const bodyString = body && Object.keys(body).length ? `body: JSON.stringify(${JSON.stringify(body, null, 2)})` : '';
  const headerString = headers.length ? `headers: { ${headers.join(', ')} }` : '';
  const options = [`method: "${endpoint.method}"`, headerString, bodyString]
    .filter(Boolean)
    .join(',\n    ');
  return `const response = await fetch("${url}", {\n    ${options}\n});\nconst data = await response.json();\nconsole.log(data);`;
}

/**
 * Generate a Python `requests` code snippet for the given endpoint.
 * @param endpoint Endpoint definition
 * @param body Body parameters
 * @param token Optional bearer token
 */
export function generatePythonSnippet(endpoint: EndpointDefinition, body: any, token?: string): string {
  const url = `${API_BASE_URL}${endpoint.path}`;
  const headers: string[] = ['"Content-Type": "application/json"'];
  if (token) headers.push('"Authorization": f"Bearer {token}"');
  const dataString = body && Object.keys(body).length ? `json=${JSON.stringify(body, null, 2)}` : '';
  const headerString = headers.length ? `{${headers.join(', ')}}` : '{}';
  const call = `response = requests.${endpoint.method.toLowerCase()}("${url}", headers=${headerString}${dataString ? `, ${dataString}` : ''})`;
  return `import requests\n\n${call}\ndata = response.json()\nprint(data)`;
}