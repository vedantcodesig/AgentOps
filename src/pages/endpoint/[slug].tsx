import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import DocsSidebar from '../../components/DocsSidebar';
import { ENDPOINTS } from '../../lib/endpoints';
import ApiRequestForm from '../../components/ApiRequestForm';

export default function EndpointPage() {
  const router = useRouter();
  const { slug } = router.query;
  const endpoint = ENDPOINTS.find(ep => ep.slug === slug);

  if (!endpoint) {
    return (
      <Layout>
        <p>Endpoint not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row">
        <DocsSidebar activeSlug={endpoint.slug} />
        <div className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-2">{endpoint.name}</h2>
          <p className="mb-4">{endpoint.description}</p>
          <div className="mb-4">
            <span className="font-mono text-xs px-2 py-1 bg-gray-200 rounded">{endpoint.method}</span>
            <span className="font-mono text-xs px-2 py-1 bg-gray-200 rounded ml-2">{endpoint.path}</span>
          </div>
          {endpoint.params && endpoint.params.length > 0 && (
            <>
              <h3 className="font-semibold mb-2">Parameters</h3>
              <table className="min-w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {endpoint.params.map(p => (
                    <tr key={p.name}>
                      <td className="px-3 py-2 text-sm">{p.name}</td>
                      <td className="px-3 py-2 text-sm">{p.type}</td>
                      <td className="px-3 py-2 text-sm">{p.required ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 text-sm">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {endpoint.example && (
            <>
              <h3 className="font-semibold mb-2">Example Body</h3>
              <pre className="p-4 bg-gray-100 border rounded text-sm overflow-auto mb-4">
                {JSON.stringify(endpoint.example, null, 2)}
              </pre>
            </>
          )}
          <h3 className="font-semibold mt-8 mb-2">Try it out</h3>
          <ApiRequestForm endpoint={endpoint} />
        </div>
      </div>
    </Layout>
  );
}