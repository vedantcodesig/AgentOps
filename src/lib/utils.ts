import { EndpointDefinition } from './endpoints';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Replaces {{VAR}} with the actual value from localStorage environment variables
export function interpolateVars(str: string, env: Record<string, string>): string {
  if (!str) return str;
  return str.replace(/\{\{([^}]+)\}\}/g, (_, key) => env[key] || `{{${key}}}`);
}

export function generateTypeScriptSnippet(endpoint: EndpointDefinition, body: any, token?: string): string {
  const url = `${API_BASE_URL}${endpoint.path}`;
  const headers: string[] = ['"Content-Type": "application/json"'];
  if (token) headers.push(`"Authorization": "Bearer ${token}"`);
  const bodyString = body && Object.keys(body).length ? `body: JSON.stringify(${JSON.stringify(body, null, 2)})` : '';
  const headerString = headers.length ? `headers: { ${headers.join(', ')} }` : '';
  const options = [`method: "${endpoint.method}"`, headerString, bodyString].filter(Boolean).join(',\n    ');
  return `const response = await fetch("${url}", {\n    ${options}\n});\nconst data = await response.json();\nconsole.log(data);`;
}

export function generatePythonSnippet(endpoint: EndpointDefinition, body: any, token?: string): string {
  const url = `${API_BASE_URL}${endpoint.path}`;
  const headers: string[] = ['"Content-Type": "application/json"'];
  if (token) headers.push('"Authorization": f"Bearer {token}"');
  const dataString = body && Object.keys(body).length ? `json=${JSON.stringify(body, null, 2)}` : '';
  const headerString = headers.length ? `{${headers.join(', ')}}` : '{}';
  const call = `response = requests.${endpoint.method.toLowerCase()}("${url}", headers=${headerString}${dataString ? `, ${dataString}` : ''})`;
  return `import requests\n\n${call}\ndata = response.json()\nprint(data)`;
}

export function generateCurlSnippet(endpoint: EndpointDefinition, body: any, token?: string): string {
  const url = `${API_BASE_URL}${endpoint.path}`;
  let snippet = `curl -X ${endpoint.method} "${url}" \\\n  -H "Content-Type: application/json"`;
  if (token) snippet += ` \\\n  -H "Authorization: Bearer ${token}"`;
  if (body && Object.keys(body).length) snippet += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
  return snippet;
}

export function generateGoSnippet(endpoint: EndpointDefinition, body: any, token?: string): string {
  const url = `${API_BASE_URL}${endpoint.path}`;
  const hasBody = body && Object.keys(body).length;
  let snippet = `package main\n\nimport (\n\t"bytes"\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n)\n\nfunc main() {\n`;
  if (hasBody) snippet += `\tjsonData, _ := json.Marshal(${JSON.stringify(body)})\n\treq, _ := http.NewRequest("${endpoint.method}", "${url}", bytes.NewBuffer(jsonData))\n`;
  else snippet += `\treq, _ := http.NewRequest("${endpoint.method}", "${url}", nil)\n`;
  snippet += `\treq.Header.Set("Content-Type", "application/json")\n`;
  if (token) snippet += `\treq.Header.Set("Authorization", "Bearer ${token}")\n`;
  snippet += `\n\tclient := &http.Client{}\n\tresp, _ := client.Do(req)\n\tdefer resp.Body.Close()\n\tfmt.Println(resp.Status)\n}`;
  return snippet;
}
