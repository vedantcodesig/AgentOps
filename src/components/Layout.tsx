import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white py-4 shadow">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            <Link href="/">AgentOps Studio</Link>
          </h1>
          <nav className="space-x-4">
            <Link href="/api-explorer" className="hover:underline">API Explorer</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} AgentOps Studio — Sample Project
      </footer>
    </div>
  );
}