import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome to AgentOps Studio</h2>
        <p>
          AgentOps Studio is a developer console for testing and debugging AI agent workflows and HTTP APIs.
          Use the API Explorer to send requests to sample endpoints, inspect responses, and generate code snippets in multiple languages.
        </p>
        <Link href="/api-explorer" className="px-4 py-2 bg-indigo-600 text-white rounded inline-block">
          Go to API Explorer
        </Link>
      </div>
    </Layout>
  );
}