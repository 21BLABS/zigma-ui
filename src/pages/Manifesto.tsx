import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const Manifesto = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-8 glow-text">ZIGMA MANIFESTO</h1>

        {/* Opening Quote */}
        <div className="border-l-4 border-green-400 pl-6 mb-8">
          <blockquote className="text-lg italic text-green-300">
            "Zigma is an oracle, not an opinion."
          </blockquote>
          <cite className="text-sm text-muted-foreground mt-2">— Zigma Core Principle</cite>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed mb-4">
              Zigma is an oracle for prediction markets, specifically designed to detect and output structural edges in Polymarket contracts where they exist.
            </p>
            <p className="mb-4">
              It does <strong>not</strong> generate opinions, probabilities on demand, or signals for the sake of activity. It remains silent by default, outputting only when a clear, survivable edge passes all internal gates.
            </p>
            <p className="text-red-400 font-semibold">
              This is not a tool for casual traders, gamblers, or those seeking constant action—most markets do not deserve a trade, and Zigma enforces that reality.
            </p>
          </section>

          {/* Core Principles */}
          <section>
            <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-green-400 pb-2">Core Principles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gray-900 p-6 border border-green-400">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Evidence Over Everything</h3>
                <p>
                  Zigma consumes verifiable data: market prices, liquidity metrics, volume trends, news deltas, structural factors, behavioral patterns, and time decay.
                </p>
                <p className="mt-2 text-muted-foreground">
                  It ignores hype, sentiment, and unsubstantiated claims. Outputs are deltas only—changes driven by evidence, not speculation.
                </p>
              </div>

              <div className="bg-gray-900 p-6 border border-green-400">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Silence as Default</h3>
                <p>
                  NO_TRADE is the baseline. Signals emerge only if an edge survives uncertainty modeling, real liquidity checks, acceptable time decay, and entropy discounting.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Rejection is explicit: EDGE INSUFFICIENT, LIQUIDITY FAIL, VOLATILITY LOCK. This prevents false positives and over-trading.
                </p>
              </div>

              <div className="bg-gray-900 p-6 border border-green-400">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Determinism with AI Augmentation</h3>
                <p>
                  Core logic is deterministic, using fixed thresholds for survivability (short-term and long-term edge tests).
                </p>
                <p className="mt-2 text-muted-foreground">
                  AI (via LLMs like GPT or Grok) enhances analysis for news/structure/behavior/time deltas, but outputs are cached for reproducibility and bounded by confidence (base 70%, adjustable down).
                </p>
              </div>

              <div className="bg-gray-900 p-6 border border-green-400">
                <h3 className="text-xl font-semibold text-green-400 mb-3">No Hype, No Promises</h3>
                <p>
                  Zigma is not a trading bot, signal spammer, or yield farm. It won't make you rich overnight.
                </p>
                <p className="mt-2 text-muted-foreground">
                  It's built for serious participants who understand that true edges are rare, and most "opportunities" evaporate under scrutiny. DYOR—verify every signal independently.
                </p>
              </div>


              <div className="bg-gray-900 p-6 border border-green-400 md:col-span-2">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Truth in Markets</h3>
                <p>
                  Prediction markets are efficient until they're not. Zigma exploits structural inefficiencies without emotion.
                </p>
                <p className="mt-2 text-muted-foreground">
                  It speaks only when the math holds, and even then, edges are normalized for liquidity impact and entropy. Conviction does not equal tradable edge—market outlooks are non-executable views for context only.
                </p>
              </div>
            </div>
          </section>

          {/* Closing Statement */}
          <section className="text-center border-t border-green-400 pt-8">
            <p className="text-lg leading-relaxed">
              Zigma exists to cut through the noise in prediction markets. In a world flooded with signals, it chooses restraint.
            </p>
            <p className="mt-4 text-green-300 font-semibold">
              If you're here for quick wins or entertainment, look elsewhere. If you're building positions on evidence, Zigma might occasionally have something to say.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-green-400 text-center">
          <p className="text-muted-foreground">Read the <Link to="/docs" className="terminal-link">full documentation</Link> or check <Link to="/logs" className="terminal-link">live logs</Link>.</p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Manifesto;
