export default function ResponseViewer({ response }: { response: any }) {
  if (!response) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Response</h3>
      <pre className="p-4 bg-gray-100 border rounded overflow-auto text-sm">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}