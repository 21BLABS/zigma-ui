import { useState } from "react";

interface MetricTooltipProps {
  children: React.ReactNode;
  content: string;
}

export const MetricTooltip = ({ children, content }: MetricTooltipProps) => {
  const [show, setShow] = useState(false);
  const [hasSeen, setHasSeen] = useState(() => {
    const seen = localStorage.getItem(`tooltip-${content.slice(0, 20)}`);
    return seen === 'true';
  });

  if (hasSeen) return <>{children}</>;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg shadow-xl z-50 w-64">
            <p className="text-xs text-green-100">{content}</p>
            <button
              onClick={() => {
                setHasSeen(true);
                localStorage.setItem(`tooltip-${content.slice(0, 20)}`, 'true');
              }}
              className="mt-2 text-[10px] text-green-400 hover:text-green-300 underline"
            >
              Got it, don't show again
            </button>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-2 h-2 bg-gray-900 border-r border-b border-green-500/50 rotate-45" />
        </>
      )}
    </div>
  );
};
