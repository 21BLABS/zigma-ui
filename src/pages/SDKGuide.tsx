import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const SDKGuide = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">Developer Docs • Version 2.0</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / SDK GUIDE</p>
            <h1 className="text-4xl font-bold text-white leading-tight">ZIGMA SDK Integration Guide</h1>
            <p className="text-green-300 text-lg max-w-3xl">
              Complete guide to integrating ZIGMA's prediction market intelligence into your applications. Python, JavaScript, and React examples included.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 uppercase tracking-[0.3em]">Min Requirements</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">1,000 ZIGMA</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 uppercase tracking-[0.3em]">Languages</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">Python • JS • Go</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 uppercase tracking-[0.3em]">Rate Limit</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">100-10K/min</p>
              </div>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🚀 Getting Started</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Prerequisites</p>
                <ul className="text-sm text-green-300 space-y-1">
                  <li>• ZIGMA Tokens: 1,000+ $ZIGMA</li>
                  <li>• API Key: From dashboard</li>
                  <li>• Node.js 16+ / Python 3.8+</li>
                  <li>• Solana wallet</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Account Setup</p>
                <ul className="text-sm text-green-300 space-y-1">
                  <li>• Create account at zigma.ai</li>
                  <li>• Verify wallet connection</li>
                  <li>• Generate API key</li>
                  <li>• Fund wallet with tokens</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🐍 Python SDK</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Installation</p>
                <code className="text-green-200 text-sm">pip install zigma</code>
              </div>
              
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Basic Setup</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`from zigma import ZigmaClient

client = ZigmaClient(
    api_key="your_api_key_here",
    wallet_address="your_wallet_address_here"
)

# Test connection
status = client.get_status()
print(f"Status: {status['status']}")`}
                </pre>
              </div>

              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Get Signals</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`# Get filtered signals
signals = client.get_signals(
    platform="polymarket",
    min_confidence=0.7,
    min_edge=0.05
)

for signal in signals:
    print(f"Market: {signal['question']}")
    print(f"Direction: {signal['direction']}")
    print(f"Confidence: {signal['confidence']}")`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🟢 JavaScript SDK</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Installation</p>
                <code className="text-green-200 text-sm">npm install zigma-js</code>
              </div>
              
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Basic Setup</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`import { ZigmaClient } from 'zigma-js';

const client = new ZigmaClient({
  apiKey: 'your_api_key_here',
  walletAddress: 'your_wallet_address_here'
});

// Test connection
const status = await client.getStatus();
console.log('Status:', status.status);`}
                </pre>
              </div>

              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Get Signals</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`const signals = await client.getSignals({
  platform: 'polymarket',
  minConfidence: 0.7,
  minEdge: 0.05
});

signals.forEach(signal => {
  console.log('Market:', signal.question);
  console.log('Direction:', signal.direction);
  console.log('Confidence:', signal.confidence);
});`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📱 React Integration</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <div className="bg-black border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 mb-2">Signal Dashboard Component</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`import React, { useState, useEffect } from 'react';
import { ZigmaClient } from 'zigma-js';

function SignalDashboard() {
  const [signals, setSignals] = useState([]);
  const client = new ZigmaClient({
    apiKey: process.env.REACT_APP_ZIGMA_API_KEY,
    walletAddress: process.env.REACT_APP_WALLET_ADDRESS
  });

  useEffect(() => {
    const fetchSignals = async () => {
      const fetchedSignals = await client.getSignals({
        platform: 'polymarket',
        minConfidence: 0.7
      });
      setSignals(fetchedSignals);
    };
    fetchSignals();
  }, []);

  return (
    <div className="signal-dashboard">
      <h2>Active ZIGMA Signals</h2>
      {signals.map(signal => (
        <div key={signal.id}>
          <h3>{signal.question}</h3>
          <span>Direction: {signal.direction}</span>
          <span>Confidence: {(signal.confidence * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Python WebSocket</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`import asyncio

async def handle_signals():
    async for signal in client.stream_signals():
        print(f"New signal: {signal['question']}")
        print(f"Direction: {signal['direction']}")
        print(f"Confidence: {signal['confidence']}")
        
        if signal['confidence'] > 0.8:
            await execute_trade(signal)

asyncio.run(handle_signals())`}
                </pre>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">JavaScript WebSocket</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`const signalStream = client.streamSignals({
  platform: 'polymarket',
  minConfidence: 0.7
});

for await (const signal of signalStream) {
  console.log('New signal:', signal.question);
  console.log('Direction:', signal.direction);
  console.log('Confidence:', signal.confidence);
  
  if (signal.confidence > 0.8) {
    await executeTrade(signal);
  }
}`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🤖 AI Chat Integration</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Python Chat</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`response = client.chat(
    message="What's your analysis of BTC?",
    market_id="polymarket_12345",
    analysis_depth="comprehensive"
)

print(f"Response: {response['message']}")
print(f"Confidence: {response['analysis']['confidence']}")
print(f"Cost: {response['cost_zigma']} ZIGMA")`}
                </pre>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">JavaScript Chat</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`const response = await client.chat({
  message: "Analyze BTC market",
  marketId: 'polymarket_12345',
  analysisDepth: 'comprehensive'
});

console.log('Response:', response.message);
console.log('Confidence:', response.analysis.confidence);
console.log('Cost:', response.costZigma, 'ZIGMA');`}
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📊 Portfolio Management</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <pre className="text-green-200 text-xs overflow-x-auto">
{`# Get portfolio performance
portfolio = client.get_portfolio_performance()

print(f"Total Value: {portfolio['total_value']}")
print(f"Win Rate: {portfolio['win_rate']}")
print(f"Total Return: {portfolio['total_return']}")

# Get individual positions
for position in portfolio['positions']:
    print(f"Market: {position['market_id']}")
    print(f"PnL: {position['pnl']}")
    print(f"Status: {position['status']}")`}
              </pre>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔧 Configuration</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <div className="bg-black border border-green-500/30 p-4 rounded-xl mb-4">
                <p className="text-xs text-green-300 mb-2">Environment Variables</p>
                <pre className="text-green-200 text-xs overflow-x-auto">
{`# .env file
ZIGMA_API_KEY=your_api_key_here
ZIGMA_WALLET_ADDRESS=your_wallet_address_here
ZIGMA_ENVIRONMENT=production
ZIGMA_LOG_LEVEL=info`}
                </pre>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Error Handling</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`import logging
from zigma import ZigmaError, RateLimitError

class SafeZigmaClient:
    def __init__(self, api_key, wallet_address):
        self.client = ZigmaClient(api_key, wallet_address)
        self.retry_count = 3
    
    async def get_signals_with_retry(self, **kwargs):
        for attempt in range(self.retry_count):
            try:
                return await self.client.get_signals(**kwargs)
            except RateLimitError as e:
                wait_time = e.retry_after or 2 ** attempt
                await asyncio.sleep(wait_time)
            except ZigmaError as e:
                if attempt == self.retry_count - 1:
                    raise
                await asyncio.sleep(1)}`}
                  </pre>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Rate Limiting</p>
                  <pre className="text-green-200 text-xs overflow-x-auto">
{`class RateLimitedZigmaClient {
  constructor(apiKey, walletAddress) {
    this.client = new ZigmaClient({ apiKey, walletAddress });
    this.minInterval = 100; // 100ms between requests
  }

  async getSignals(options = {}) {
    return this.queueRequest('getSignals', options);
  }

  async queueRequest(method, args) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ method, args, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const { method, args, resolve, reject } = this.requestQueue.shift();
      
      const now = Date.now();
      const timeSinceLast = now - this.lastRequest;
      
      if (timeSinceLast < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLast);
      }
      
      try {
        const result = await this.client[method](args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      this.lastRequest = Date.now();
    }
    
    this.processing = false;
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
              <h2 className="text-2xl font-semibold text-white">📚 Additional Resources</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">SDK Documentation</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Python SDK: pypi.org/project/zigma</li>
                  <li>• JavaScript SDK: npmjs.com/package/zigma-js</li>
                  <li>• GitHub: github.com/zigma-ai/sdk</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Community</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Developer Discord: discord.gg/zigma-devs</li>
                  <li>• Stack Overflow: tag zigma-sdk</li>
                  <li>• GitHub Issues: report bugs</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Examples</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Trading Bot Framework</li>
                  <li>• React Dashboard</li>
                  <li>• Mobile App Integration</li>
                  <li>• Backend Service</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🚀 Quick Start Checklist</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Before You Begin</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>□ Create ZIGMA account</li>
                  <li>□ Verify wallet address</li>
                  <li>□ Purchase 1,000+ $ZIGMA</li>
                  <li>□ Generate API key</li>
                  <li>□ Install SDK</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">First Integration</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>□ Initialize SDK</li>
                  <li>□ Test API connection</li>
                  <li>□ Fetch first signals</li>
                  <li>□ Implement error handling</li>
                  <li>□ Set up rate limiting</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-200 font-semibold mb-2">Production</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>□ Use production endpoints</li>
                  <li>□ Comprehensive error handling</li>
                  <li>□ Set up monitoring</li>
                  <li>□ Configure rate limiting</li>
                  <li>□ Test with sandbox first</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="text-center py-8 border-t border-green-500/20">
            <p className="text-sm text-green-300">
              ZIGMA SDK Guide v2.0 | Last Updated: January 2026
            </p>
            <p className="text-xs text-green-300 mt-2">
              Need help? Contact us at dev-support@zigma.ai or join our developer Discord
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SDKGuide;
