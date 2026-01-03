import { Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";

const LogsDisplay = lazy(() =>
  import("@/components/LogsDisplay").then((module) => ({ default: module.LogsDisplay }))
);

const Logs = () => {
  const [liveLogs, setLiveLogs] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        const logsRes = await fetch(API_BASE + "/logs");
        if (!logsRes.ok) throw new Error(`Failed to fetch logs: ${logsRes.status}`);
        const logsData = await logsRes.json();
        if (isMounted) {
          setLiveLogs(logsData.logs);
          setError(null);
          setIsLoading(false);
          setLastUpdated(Date.now());
        }
      } catch (e) {
        console.error("Failed to fetch logs:", e);
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setIsLoading(false);
          setLastUpdated(Date.now());
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // refresh every 2s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-4">
          <Link to="/" className="terminal-link">
            &lt; BACK TO ORACLE CORE
          </Link>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-400 glow-text">LIVE SIGNAL LOG</h1>
            <p className="text-xs text-muted-foreground">
              Auto-updated terminal feed (latest 200 lines). Stream-only, no clipboard.
            </p>
          </div>
          <div className="text-xs text-gray-400 flex flex-col items-end">
            {error ? (
              <span className="text-red-400">Feed error: {error}</span>
            ) : isLoading ? (
              <span className="animate-pulse text-green-300">Connecting...</span>
            ) : (
              <span className="text-green-300">● Live</span>
            )}
            {lastUpdated && !error && (
              <span className="text-[10px] text-gray-500 mt-1">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div>
          {error ? (
            <div className="bg-red-900 border border-red-400 p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          ) : (
            <Suspense fallback={<div className="text-green-400">Booting terminal...</div>}>
              <LogsDisplay logs={liveLogs} />
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
};

export default Logs;
