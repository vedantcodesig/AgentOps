import { useState } from 'react';
import { ENDPOINTS, EndpointDefinition } from '../lib/endpoints';
import ApiRequestForm from './ApiRequestForm';

export default function ApiExplorer() {
  const [selected, setSelected] = useState<EndpointDefinition>(ENDPOINTS[0]);

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-x-8 lg:space-y-0">
      <div className="lg:w-1/3">
        <h2 className="font-semibold mb-2">Select Endpoint</h2>
        <ul className="divide-y divide-gray-200">
          {ENDPOINTS.map(ep => (
            <li
              key={ep.slug}
              className={`p-2 cursor-pointer ${selected.slug === ep.slug ? 'bg-indigo-50 text-indigo-700' : ''}`}
              onClick={() => setSelected(ep)}
            >
              <div className="font-medium">{ep.name}</div>
              <div className="text-sm text-gray-500">
                {ep.method} {ep.path}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2">{selected.name}</h2>
        <p className="mb-4 text-gray-700">{selected.description}</p>
        <ApiRequestForm endpoint={selected} />
      </div>
    </div>
  );
}