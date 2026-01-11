import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const Docs = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">Last synced · {new Date().toLocaleDateString()}</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / LIVING DOCUMENT</p>
            <h1 className="text-4xl font-bold text-white leading-tight">An oracle that only speaks when the math survives.</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              This page is the public spec for Agent Zigma: the deterministic process, the UX surfaces, and the upcoming unlocks. No hype, no filler—just the operating system for serious prediction-market participants.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Coverage</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">20,000+ markets</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Cycle cadence</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">~15 min</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Signal discipline</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">NO_TRADE default</p>
              </div>
            </div>
          </header>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">01 / Vision</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <article className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Edge Covenant</p>
                <p className="text-sm text-muted-foreground">
                  Zigma only emits a trade when liquidity, entropy, and news deltas support a survivable outcome. Otherwise it documents rejection reasons so operators see exactly why a market failed inspection.
                </p>
              </article>
              <article className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Deterministic ≠ static</p>
                <p className="text-sm text-muted-foreground">
                  Every cycle hydrates market books, folds in fresh news, and replays the probability chain. The LLM layer annotates context; the final call is rule-based and reproducible.
                </p>
              </article>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">02 / System Stack</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Observability",
                  body: "Cycle logs, rejection causes, and hydration snapshots are streamed to the /logs page for public auditing."
                },
                {
                  title: "Retrieval + Matching",
                  body: "Slug + token heuristics determine the exact Polymarket contract before any LLM involvement."
                },
                {
                  title: "Oracle Brain",
                  body: "LLM-assisted deltas (news/structure/behavior/time) feed a deterministic scoring layer that decides BUY/SELL/HOLD."
                }
              ].map((card) => (
                <article key={card.title} className="bg-gray-950 border border-green-500/20 p-5 rounded-xl space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-green-400">{card.title}</p>
                  <p className="text-sm text-muted-foreground">{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">03 / Live Surfaces</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/30 p-6 rounded-2xl space-y-3">
                <p className="text-lg font-semibold text-green-200">Chat Terminal</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Context-aware chat threads with hydrated market metadata.</li>
                  <li>Latest recommendation module with edge, odds, and confidence.</li>
                  <li>Resettable context to rerun analysis after news hits.</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/30 p-6 rounded-2xl space-y-3">
                <p className="text-lg font-semibold text-green-200">Dashboard</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>System status card with uptime, cycle throughput, and heartbeat.</li>
                  <li>Executable deck vs. Basket deck toggle for future portfolio mode.</li>
                  <li>Volatility tape + audit log references for transparency.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">04 / Basket Engine Roadmap</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Status: prototyping</p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    badge: "Phase A",
                    title: "Curated slates",
                    body: "Macro & election baskets with manual sizing guidance."
                  },
                  {
                    badge: "Phase B",
                    title: "Sizing heuristics",
                    body: "Auto-exposure recommendations with liquidity-aware caps."
                  },
                  {
                    badge: "Phase C",
                    title: "One-click deploy",
                    body: "Trigger flows that mirror basket allocations on supported venues."
                  }
                ].map((item) => (
                  <article key={item.title} className="border border-green-500/20 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-green-300">{item.badge}</p>
                    <p className="text-lg text-white">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">05 / Operational Discipline</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-4 text-center text-sm text-muted-foreground">
                {["Fetch universe", "Hydrate books", "Delta analysis", "Decision + log"].map((step, idx) => (
                  <div key={step} className="p-4 border border-green-500/10 rounded-xl">
                    <p className="text-xs uppercase tracking-[0.3em] text-green-300">Step {idx + 1}</p>
                    <p className="text-white mt-2">{step}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Every decision is logged with a deterministic hash. When the chat endpoint answers, it attaches the matched market, the similarity, the delta mix, and the rejection or execution reason. The logs page exposes this telemetry for anyone to audit.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">06 / API Documentation</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Base URL</p>
                <code className="block bg-black/50 border border-green-500/30 p-3 rounded text-green-300 text-sm">
                  https://api.zigma.pro
                </code>
              </div>

              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Available Endpoints</p>
                
                <div className="space-y-3">
                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-black text-xs px-2 py-1 rounded font-bold">GET</span>
                      <code className="text-green-300 text-sm">/api/watchlist</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Retrieve your watchlist of markets</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-black text-xs px-2 py-1 rounded font-bold">POST</span>
                      <code className="text-green-300 text-sm">/api/watchlist</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Add a market to your watchlist</p>
                    <p className="text-xs text-gray-500 mt-1">Body: {`{ "marketId": "string" }`}</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-600 text-black text-xs px-2 py-1 rounded font-bold">DELETE</span>
                      <code className="text-green-300 text-sm">/api/watchlist/:marketId</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Remove a market from your watchlist</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-black text-xs px-2 py-1 rounded font-bold">POST</span>
                      <code className="text-green-300 text-sm">/api/watchlist/bulk</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Bulk import markets to watchlist</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-black text-xs px-2 py-1 rounded font-bold">GET</span>
                      <code className="text-green-300 text-sm">/api/signals/performance</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get overall signal performance metrics</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-black text-xs px-2 py-1 rounded font-bold">GET</span>
                      <code className="text-green-300 text-sm">/api/signals/recent</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get recent signals with optional filters</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-black text-xs px-2 py-1 rounded font-bold">GET</span>
                      <code className="text-green-300 text-sm">/api/risk-metrics</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get risk metrics (Sharpe, Sortino, Max Drawdown, VaR, CVaR, Calmar)</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-black text-xs px-2 py-1 rounded font-bold">GET</span>
                      <code className="text-green-300 text-sm">/api/pnl/aggregate</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get aggregated P&L and backtest results</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-black text-xs px-2 py-1 rounded font-bold">POST</span>
                      <code className="text-green-300 text-sm">/chat</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Query Zigma about any market or user</p>
                  </div>

                  <div className="border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-black text-xs px-2 py-1 rounded font-bold">GET</span>
                      <code className="text-green-300 text-sm">/status</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get system status and operational metrics</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-sm text-yellow-400 font-semibold mb-1">Rate Limits</p>
                  <p className="text-xs text-yellow-400/80">All endpoints are rate-limited to 60 requests per minute per IP.</p>
                </div>
              </div>
            </div>
          </section>


          <footer className="border-t border-green-500/20 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Need more context? Read the <Link to="/manifesto" className="terminal-link">Manifesto</Link>, watch the live <Link to="/logs" className="terminal-link">signal logs</Link>, or interrogate the model on the <Link to="/chat" className="terminal-link">Chat page</Link>.
            </p>
            <Link to="/chat" className="terminal-btn inline-flex items-center gap-2">
              <span className="text-muted-foreground">&gt;</span>
              LAUNCH TERMINAL
            </Link>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;
