import { Link } from "react-router-dom";

const Docs = () => {
  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="terminal-link">&lt; BACK TO ORACLE CORE</Link>
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-8 glow-text">ZIGMA DOCUMENTATION</h1>

        {/* Table of Contents */}
        <nav className="bg-gray-900 border border-green-400 p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#guide" className="terminal-link">User Guide</a></li>
            <li><a href="#faq" className="terminal-link">FAQ</a></li>
            <li><a href="#roadmap" className="terminal-link">Roadmap</a></li>
          </ul>
        </nav>

        <section id="guide" className="mb-12">
          <h2 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-400 pb-2">User Guide</h2>
          <p className="mb-6 text-lg">
            How to use Zigma without illusions: It's an oracle, not an advisor. Outputs are tools—your responsibility to act (or not).
          </p>

          <h3 className="text-xl font-semibold text-green-400 mb-2">Getting Started</h3>
          <div className="bg-gray-900 border border-green-400 p-4 mb-4">
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit www.zigma.pro and explore the dashboard.</li>
              <li>Monitor system status, executable trades, market outlooks, and rejected signals.</li>
              <li>Access live logs at /logs for real-time processing details.</li>
              <li>For premium features, prepare for ZIGMA token integration (Q2 2026).</li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold text-green-400 mb-2">Understanding Outputs</h3>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div className="bg-gray-900 border border-green-400 p-4">
              <h4 className="font-bold text-green-400 mb-2">Executable Trades</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Rare signals with action (BUY YES/NO), confidence (50-100%), exposure (0-3%), and effective edge.</li>
                <li>Normalized for liquidity and entropy impact.</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-green-400 p-4">
              <h4 className="font-bold text-green-400 mb-2">Market Outlooks</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Non-tradable model leans with conviction scores.</li>
                <li>For strategic context, not direct trading.</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-green-400 p-4">
              <h4 className="font-bold text-green-400 mb-2">Rejected Signals</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Explicit reasons: EDGE INSUFFICIENT, LIQUIDITY FAIL, etc.</li>
                <li>Includes evaluation counts for transparency.</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-green-400 p-4">
              <h4 className="font-bold text-green-400 mb-2">Operational Logs</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Audit trail of cycles, evaluations, and timestamps.</li>
                <li>Public transparency, not trading advice.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-green-400 mb-2">Analysis Breakdown</h3>
          <div className="bg-gray-900 border border-green-400 p-4 mb-4">
            <div className="space-y-3">
              <div>
                <strong className="text-green-400">Probability Chain:</strong> Market odds → Prior + Deltas (news/struct/behavior/time) → Zigma odds → Edge calculation.
              </div>
              <div>
                <strong className="text-green-400">Effective Edge:</strong> Raw edge × confidence × (1-entropy) × liqFactor. Must exceed threshold for signals.
              </div>
              <div>
                <strong className="text-green-400">Survivability:</strong> Tests short-term (immediate) and long-term (horizon) edge persistence.
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-green-400 mb-2">Best Practices</h3>
          <div className="bg-gray-900 border border-green-400 p-4">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>DYOR:</strong> Always verify with Polymarket and trusted sources.</li>
              <li><strong>Risk Management:</strong> Suggested exposure is a max, not min. Losses are possible.</li>
              <li><strong>Frequency:</strong> Cycles run ~15min; refresh for updates.</li>
              <li><strong>Limits:</strong> Free access to dashboard; premium requires token burns.</li>
              <li><strong>Troubleshooting:</strong> No signals? Markets lack edges—that's normal. Report issues via Telegram.</li>
            </ul>
            <p className="mt-4 text-red-400 font-semibold">No hand-holding: If this confuses you, Zigma isn't for you.</p>
          </div>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-400 pb-2">Zigma FAQ</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-green-400 border-l-2 border-green-400 pl-4">General</h3>
              <div className="ml-4 space-y-4">
                <div>
                  <p className="font-medium">Q: Is Zigma financial advice?</p>
                  <p className="text-muted-foreground">A: No. Educational tool only. Trading risks capital loss. Consult professionals.</p>
                </div>
                <div>
                  <p className="font-medium">Q: Why so many NO_TRADE?</p>
                  <p className="text-muted-foreground">A: Most markets lack survivable edges. Zigma avoids junk signals.</p>
                </div>
                <div>
                  <p className="font-medium">Q: How accurate are signals?</p>
                  <p className="text-muted-foreground">A: Conservatively normalized. Backtests pending; test independently.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 border-l-2 border-green-400 pl-4">Technical</h3>
              <div className="ml-4 space-y-4">
                <div>
                  <p className="font-medium">Q: Supported markets?</p>
                  <p className="text-muted-foreground">A: Polymarket now; expansions to Kalshi/Manifold if viable.</p>
                </div>
                <div>
                  <p className="font-medium">Q: Bugs or issues?</p>
                  <p className="text-muted-foreground">A: Expected in v1. SAFE_MODE prevents mishaps. Report for fixes.</p>
                </div>
                <div>
                  <p className="font-medium">Q: Why launch on Dec 31, 2025?</p>
                  <p className="text-muted-foreground">A: Core ready. No artificial delays. Live signals now.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 border-l-2 border-green-400 pl-4">Token & Future</h3>
              <div className="ml-4 space-y-4">
                <div>
                  <p className="font-medium">Q: Token required?</p>
                  <p className="text-muted-foreground">A: No for basics. Yes for premiums; burns ration access.</p>
                </div>
                <div>
                  <p className="font-medium">Q: Future of Zigma?</p>
                  <p className="text-muted-foreground">A: Focused evolution. If no value, fades. No pivots.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap">
          <h2 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-400 pb-2">Roadmap</h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-400"></div>

            <div className="space-y-8">
              <div className="relative flex items-start">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-black font-bold mr-6">0</div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Phase 0: Launch (Today, Dec 31, 2025)</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Core Engine Live: 500+ markets, filtering, volume spikes.</li>
                    <li>AI-enhanced analysis, signal outputs, dashboard.</li>
                    <li>Persistence, fallbacks, public access.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-black font-bold mr-6">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Phase 1: Stability & Polish (Q1 2026)</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Fix 404s, user feedback, enhanced filtering.</li>
                    <li>API exposure, monitoring, metrics goals.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-black font-bold mr-6">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Phase 2: Scalability & Premium (Q2 2026)</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Token launch, burn mechanics for premiums.</li>
                    <li>Multi-market, AI upgrades, social automation.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-black font-bold mr-6">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Phase 3: Advanced Intelligence (Q3-Q4 2026)</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>ML integration, user tools, resilience upgrades.</li>
                    <li>V3: Public basket trading with perpetual yield to holders.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-black font-bold mr-6">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">V4: Multi-Market Expansion</h3>
                  <p className="mt-2">Kalshi, opinion trades, and other prediction markets integrated.</p>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-6">∞</div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Long-term</h3>
                  <p className="mt-2">Lean focus on edge detection. Self-funded or maintained.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-green-400 text-center">
          <p className="text-muted-foreground">For more details, check the <Link to="/manifesto" className="terminal-link">Manifesto</Link> or <Link to="/logs" className="terminal-link">Live Logs</Link>.</p>
        </div>
      </div>
    </main>
  );
};

export default Docs;
