import React, { useEffect, useMemo, useRef } from "react";

export function LogsDisplay({ logs }: { logs?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const content = useMemo(() => (logs && logs.trim() ? logs : "Awaiting telemetry..."), [logs]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black/90 text-green-300 font-mono text-sm border border-green-600 rounded-lg p-4 h-[70vh] w-full overflow-y-auto shadow-[0_0_30px_rgba(16,185,129,0.35)]"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_70%)]" />
      <pre className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-tight text-green-200">
        {content}
      </pre>
    </div>
  );
}
