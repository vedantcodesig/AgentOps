import Link from 'next/link';
import { ENDPOINTS } from '../lib/endpoints';

export default function DocsSidebar({ activeSlug }: { activeSlug?: string }) {
  return (
    <aside className="p-4 border-r border-gray-200 w-full sm:w-64">
      <h2 className="font-semibold mb-2">Endpoints</h2>
      <ul>
        {ENDPOINTS.map(ep => (
          <li key={ep.slug} className={`mb-1 ${activeSlug === ep.slug ? 'font-bold text-indigo-600' : ''}`}>
            <Link href={`/endpoint/${ep.slug}`}>{ep.name}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}