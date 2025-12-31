import { Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from 'react';

const LogsDisplay = lazy(() => import("@/components/LogsDisplay").then(module => ({ default: module.LogsDisplay })));

const Logs = () => {
  const [liveLogs, setLiveLogs] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const logsRes = await fetch(API_BASE + '/logs');
        if (!logsRes.ok) throw new Error(`Failed to fetch logs: ${logsRes.status}`);
        const logsData = await logsRes.json();
        setLiveLogs(logsData.logs);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        console.error('Failed to fetch logs:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = liveLogs
    .split('\n')
    .filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()))
    .join('\n');

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="terminal-link">&lt; BACK TO ORACLE CORE</Link>
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-8 glow-text">LIVE SIGNAL LOG</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md bg-gray-900 border border-green-400 text-green-400 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Real-time execution logs and signal processing. Updated every 30 seconds. {filteredLogs.split('\n').length} lines displayed.
          </p>

          {error && (
            <div className="bg-red-900 border border-red-400 p-4">
              <p className="text-red-400">Error: {error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-green-400">Loading logs...</p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading logs...</div>}>
              <LogsDisplay logs={filteredLogs} />
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
};

export default Logs;
