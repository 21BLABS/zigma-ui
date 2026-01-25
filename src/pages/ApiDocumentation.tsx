import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const ApiDocumentation = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">Developer Docs • Version 2.0</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / API DOCUMENTATION</p>
            <h1 className="text-4xl font-bold text-white leading-tight">ZIGMA API Documentation</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Complete RESTful API documentation for ZIGMA's prediction market intelligence. Real-time signals, market data, analytics, and AI chat integration.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Base URL</p>
                <p className="text-sm font-semibold text-green-200 mt-2">api.zigma.ai/v2</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Authentication</p>
                <p className="text-sm font-semibold text-green-200 mt-2">Bearer + Wallet</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Rate Limits</p>
                <p className="text-sm font-semibold text-green-200 mt-2">100-10K/min</p>
              </div>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔑 Authentication</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">HTTP Headers</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY
X-ZIGMA-Wallet: YOUR_WALLET_ADDRESS
Content-Type: application/json`}
                </pre>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Getting Started</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Hold 1,000+ $ZIGMA tokens</li>
                    <li>• Create API key from dashboard</li>
                    <li>• Verify wallet connection</li>
                    <li>• Start making authenticated calls</li>
                  </ul>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Rate Limits</p>
                  <div className="text-sm text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Basic: 100/min</div>
                      <div>1,000 ZIGMA</div>
                      <div>Pro: 1,000/min</div>
                      <div>10,000 ZIGMA</div>
                      <div>Enterprise: 10K/min</div>
                      <div>100,000 ZIGMA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🎯 Core Endpoints</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">GET /markets</p>
                <p className="text-sm text-muted-foreground mb-3">Get all available markets</p>
                <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                  <p className="text-xs text-green-300 mb-2">Response Example</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "markets": [{
    "id": "polymarket_12345",
    "platform": "polymarket",
    "question": "Will BTC reach $100k by end of 2026?",
    "current_price": 0.65,
    "liquidity": 500000,
    "volume_24h": 250000,
    "category": "cryptocurrency"
  }],
  "total": 1250,
  "page": 1,
  "per_page": 50
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">GET /markets/{'{market_id}'}</p>
                <p className="text-sm text-muted-foreground mb-3">Get detailed market information</p>
                <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                  <p className="text-xs text-green-300 mb-2">Response Example</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "id": "polymarket_12345",
  "platform": "polymarket",
  "question": "Will BTC reach $100k by end of 2026?",
  "current_price": 0.65,
  "liquidity": 500000,
  "order_book": {
    "bids": [{"price": 0.64, "size": 10000}],
    "asks": [{"price": 0.66, "size": 8000}]
  },
  "category": "cryptocurrency"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🤖 Signal Endpoints</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">GET /signals</p>
                <p className="text-sm text-muted-foreground mb-3">Get active signals with filtering</p>
                <div className="bg-black border border-green-500/30 p-4 rounded-xl mb-3">
                  <p className="text-xs text-green-300 mb-2">Query Parameters</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`platform (optional): polymarket, kalshi
category (optional): cryptocurrency, politics
min_confidence (optional): 0.1-1.0
min_edge (optional): 0.01-1.0`}
                  </pre>
                </div>
                <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                  <p className="text-xs text-green-300 mb-2">Response Example</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "signals": [{
    "id": "signal_abc123",
    "market_id": "polymarket_12345",
    "direction": "YES",
    "probability": 0.72,
    "edge": 0.07,
    "confidence": 0.85,
    "position_size": 0.03,
    "rationale": "Strong bullish sentiment...",
    "generated_at": "2025-01-25T12:00:00Z"
  }],
  "total": 15,
  "success_rate": 0.68
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">GET /signals/history</p>
                <p className="text-sm text-muted-foreground mb-3">Get historical signal performance</p>
                <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                  <p className="text-xs text-green-300 mb-2">Response Example</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "signals": [{
    "id": "signal_def456",
    "direction": "YES",
    "outcome": "CORRECT",
    "profit_loss": 0.05,
    "generated_at": "2025-01-20T10:00:00Z",
    "resolved_at": "2025-01-22T15:30:00Z"
  }],
  "performance": {
    "win_rate": 0.68,
    "avg_edge": 0.045,
    "total_return": 0.156
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📊 Analytics Endpoints</h2>
            </div>
            
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-lg text-green-200 font-semibold mb-3">GET /analytics/market/{'{market_id}'}</p>
              <p className="text-sm text-muted-foreground mb-3">Deep market analysis and recommendations</p>
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Response Example</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "market_id": "polymarket_12345",
  "analysis": {
    "price_trend": "bullish",
    "liquidity_score": 0.85,
    "volatility": 0.12,
    "sentiment": "positive",
    "prediction_accuracy": 0.72
  },
  "recommendations": [{
    "action": "BUY",
    "confidence": 0.85,
    "reason": "Strong institutional buying detected"
  }]
}`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔄 Real-time Data</h2>
            </div>
            
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-lg text-green-200 font-semibold mb-3">WebSocket Connection</p>
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">JavaScript Example</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`const ws = new WebSocket('wss://ws.zigma.ai/v2');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  api_key: 'YOUR_API_KEY',
  wallet: 'YOUR_WALLET_ADDRESS'
}));

// Subscribe to signals
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'signals',
  filters: {
    platform: 'polymarket',
    min_confidence: 0.7
  }
}));

// Receive real-time signals
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'signal') {
    console.log('New signal:', data.signal);
  }
};`}
                </pre>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>WebSocket Events:</strong></p>
                <ul className="mt-2 space-y-1">
                  <li>• <code className="text-green-200">signals</code> - Real-time signal updates</li>
                  <li>• <code className="text-green-200">markets</code> - Market price changes</li>
                  <li>• <code className="text-green-200">analytics</code> - Portfolio updates</li>
                  <li>• <code className="text-green-200">system</code> - Maintenance notifications</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🤖 AI Chat Integration</h2>
            </div>
            
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-lg text-green-200 font-semibold mb-3">POST /chat</p>
              <p className="text-sm text-muted-foreground mb-3">Chat with ZIGMA oracle for personalized analysis</p>
              <div className="bg-black border border-green-500/30 p-4 rounded-xl mb-3">
                <p className="text-xs text-green-300 mb-2">Request Body</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "message": "Analyze the BTC price prediction market",
  "context": {
    "market_id": "polymarket_12345",
    "user_profile": "aggressive",
    "risk_tolerance": 0.05
  },
  "analysis_depth": "comprehensive"
}`}
                </pre>
              </div>
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Response Example</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "response_id": "chat_123abc",
  "message": "Based on current market conditions...",
  "analysis": {
    "probability": 0.72,
    "confidence": 0.85,
    "key_factors": [
      "Institutional adoption increasing",
      "Technical indicators bullish"
    ]
  },
  "cost_zigma": 100,
  "response_time": 2.3
}`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔧 Error Handling</h2>
            </div>
            
            <div className="bg-gray-950 border border-red-500/20 p-6 rounded-2xl">
              <div className="bg-black border border-red-500/30 p-4 rounded-xl mb-3">
                <p className="text-xs text-red-300 mb-2">Error Response Format</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient ZIGMA token balance",
    "details": {
      "required": 1000,
      "current": 500
    },
    "request_id": "req_123abc"
  }
}`}
                </pre>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Common Error Codes:</strong></p>
                <ul className="mt-2 space-y-1">
                  <li>• <code className="text-red-200">401</code> - Unauthorized (invalid API key)</li>
                  <li>• <code className="text-red-200">403</code> - Forbidden (insufficient $ZIGMA balance)</li>
                  <li>• <code className="text-red-200">429</code> - Rate limit exceeded</li>
                  <li>• <code className="text-red-200">500</code> - Internal server error</li>
                  <li>• <code className="text-red-200">503</code> - Service temporarily unavailable</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📝 Code Examples</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Python SDK</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`from zigma import ZigmaClient

client = ZigmaClient(
    api_key="YOUR_API_KEY",
    wallet_address="YOUR_WALLET_ADDRESS"
)

# Get signals
signals = client.get_signals(
    platform="polymarket",
    min_confidence=0.7
)

# Chat with oracle
response = client.chat(
    message="Analyze BTC market",
    market_id="polymarket_12345"
)`}
                </pre>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">JavaScript SDK</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`import { ZigmaClient } from 'zigma-js';

const client = new ZigmaClient({
  apiKey: 'YOUR_API_KEY',
  walletAddress: 'YOUR_WALLET_ADDRESS'
});

// Get signals
const signals = await client.getSignals({
  platform: 'polymarket',
  minConfidence: 0.7
});

// Chat with oracle
const response = await client.chat({
  message: 'Analyze BTC market',
  marketId: 'polymarket_12345'
});`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🚀 Getting Started</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">1. Setup</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`# Python
pip install zigma

# JavaScript
npm install zigma-js`}
                </pre>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">2. Authentication</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`# Python
from zigma import ZigmaClient
client = ZigmaClient(api_key, wallet)`}
                </pre>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">3. First Request</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`# Get signals
signals = client.get_signals()
print(f"Found {len(signals)} signals")`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📞 Support</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Developer Resources</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Documentation: docs.zigma.ai</li>
                  <li>• SDK Downloads: github.com/zigma-ai</li>
                  <li>• Status Page: status.zigma.ai</li>
                  <li>• Developer Discord: discord.gg/zigma-devs</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Contact</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• API Support: api-support@zigma.ai</li>
                  <li>• Technical Issues: tech-support@zigma.ai</li>
                  <li>• Business Inquiries: business@zigma.ai</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Changelog</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• v2.0 (Jan 2026): WebSocket, AI chat</li>
                  <li>• v1.5 (Dec 2025): Kalshi support</li>
                  <li>• v1.0 (Nov 2025): Initial release</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="text-center py-8 border-t border-green-500/20">
            <p className="text-sm text-muted-foreground">
              ZIGMA API Documentation v2.0 | Last Updated: January 2026
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Need help? Contact us at api-support@zigma.ai or join our developer Discord
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocumentation;
