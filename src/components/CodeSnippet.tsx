import { useState } from 'react';

const LANGS = ['ts', 'python', 'curl', 'go'] as const;
type Lang = typeof LANGS[number];

function generateCurl(url: string, method: string, body: any, token?: string): string {
  const headers = token ? ` \\\n  -H "Authorization: Bearer ${token}" \\\n  -H "Content-Type: application/json"` : ` \\\n  -H "Content-Type: application/json"`;
  const data = body && Object.keys(body).length ? ` \\\n  -d '${JSON.stringify(body)}'` : '';
  return `curl -X ${method} "${url}"${headers}${data}`;
}

function generateGo(url: string, method: string, body: any, token?: string): string {
  const hasBody = body && Object.keys(body).length;
  return `package main

import (
  "fmt"
  "net/http"${hasBody ? '\n  "strings"\n  "io"' : '\n  "io"'}
)

func main() {
  ${hasBody ? `payload := strings.NewReader(\`${JSON.stringify(body)}\`)
  req, _ := http.NewRequest("${method}", "${url}", payload)` : `req, _ := http.NewRequest("${method}", "${url}", nil)`}
  req.Header.Set("Content-Type", "application/json")${token ? `\n  req.Header.Set("Authorization", "Bearer ${token}")` : ''}
  resp, _ := http.DefaultClient.Do(req)
  defer resp.Body.Close()
  body, _ := io.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;
}

export default function CodeSnippet({ code, language, url, method, body, token }: {
  code: string; language: string;
  url?: string; method?: string; body?: any; token?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Lang>(language === 'python' ? 'python' : 'ts');

  const getCode = () => {
    if (!url) return code;
    if (lang === 'curl') return generateCurl(url, method || 'GET', body, token);
    if (lang === 'go') return generateGo(url, method || 'GET', body, token);
    return code;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {LANGS.map(l => (
            <button key={l} className={`tab${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}
              style={{ fontSize: 11, padding: '3px 10px' }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? 'var(--green)' : 'var(--text3)', fontSize: 12, cursor: 'pointer' }}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', overflowX: 'auto', whiteSpace: 'pre' }}>
        <code>{getCode()}</code>
      </pre>
    </div>
  );
}
