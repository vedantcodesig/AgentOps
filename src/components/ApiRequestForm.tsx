import { useState, useEffect } from 'react';
import type { EndpointDefinition } from '../lib/endpoints';
import CodeSnippet from './CodeSnippet';
import ResponseViewer from './ResponseViewer';
import { generateTypeScriptSnippet, generatePythonSnippet, API_BASE_URL } from '../lib/utils';

export default function ApiRequestForm({ endpoint }: { endpoint: EndpointDefinition }) {
  const [params, setParams] = useState<Record<string, any>>({});
  const [token, setToken] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'ts' | 'py'>('ts');

  useEffect(() => {
    // Load saved token from localStorage if present
    const saved = localStorage.getItem('authToken');
    if (saved) setToken(saved);
  }, []);

  const handleParamChange = (name: string, value: string) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const url = `${API_BASE_URL}${endpoint.path}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const options: RequestInit = { method: endpoint.method, headers };
      if (endpoint.method !== 'GET') {
        options.body = JSON.stringify(params);
      }
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.detail) || res.statusText);
      } else {
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem('authToken', token);
    alert('Token saved to local storage');
  };

  const tsSnippet = generateTypeScriptSnippet(endpoint, params, token || undefined);
  const pySnippet = generatePythonSnippet(endpoint, params, token || undefined);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {endpoint.params && endpoint.params.map(param => (
          <div key={param.name}>
            <label className="block text-sm font-medium text-gray-700">
              {param.name}{param.required ? '*' : ''}
            </label>
            <input
              type="text"
              required={param.required}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              onChange={e => handleParamChange(param.name, e.target.value)}
            />
            <p className="text-xs text-gray-500">{param.description}</p>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700">Auth Token</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
            value={token}
            onChange={e => setToken(e.target.value)}
          />
          <button type="button" onClick={handleSaveToken} className="mt-1 text-sm text-indigo-600 hover:underline">
            Save token
          </button>
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
      <div>
        <div className="flex space-x-2 mb-2">
          <button
            className={`px-2 py-1 rounded ${language === 'ts' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setLanguage('ts')}
          >
            TypeScript
          </button>
          <button
            className={`px-2 py-1 rounded ${language === 'py' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setLanguage('py')}
          >
            Python
          </button>
        </div>
        {language === 'ts' ? (
          <CodeSnippet code={tsSnippet} language="ts" />
        ) : (
          <CodeSnippet code={pySnippet} language="python" />
        )}
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <ResponseViewer response={response} />
    </div>
  );
}