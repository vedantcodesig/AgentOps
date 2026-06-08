import { useState } from 'react';

export default function CodeSnippet({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 text-sm px-2 py-1 rounded bg-indigo-600 text-white"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="overflow-auto p-4 bg-gray-800 text-gray-100 text-sm rounded">
        <code>{code}</code>
      </pre>
    </div>
  );
}