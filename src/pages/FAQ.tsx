import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">Frequently Asked Questions</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / FAQ</p>
            <h1 className="text-4xl font-bold text-white leading-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Find answers to common questions about ZIGMA's AI-powered prediction market intelligence platform, token economics, platform usage, and more.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Signal Accuracy</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">68-72%</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Total Supply</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">1B ZIGMA</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Chat Cost</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">100 ZIGMA</p>
              </div>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🚀 Getting Started</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What is ZIGMA?</p>
                <p className="text-sm text-muted-foreground">
                  ZIGMA is an AI-powered prediction market intelligence platform that serves as "The Silent Oracle." We analyze prediction markets across multiple platforms (Polymarket, Kalshi, Jupiter, Raydium, Option Markets) and generate high-confidence trading signals only when structural edge exists.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How does ZIGMA work?</p>
                <p className="text-sm text-muted-foreground">
                  Our system uses advanced AI models to analyze market data, news sentiment, social media trends, and market microstructure. We generate signals with confidence scores and edge calculations, helping traders make informed decisions.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What makes ZIGMA different?</p>
                <p className="text-sm text-muted-foreground mb-2">
                  • AI-Powered: Advanced LLM-driven analysis
                  • Multi-Platform: Coverage across 5+ major platforms
                  • Token-Gated: Pay-per-use model with $ZIGMA
                  • Autonomous Trading: Self-executing basket contract
                  • Community-Driven: DAO governance and transparency
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">💰 Token & Economics</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What is the $ZIGMA token used for?</p>
                <p className="text-sm text-muted-foreground">
                  $ZIGMA tokens have multiple utilities:
                  • <strong>Access Control</strong>: Required for chat features and API usage
                  • <strong>Governance</strong>: 1 $ZIGMA = 1 vote in DAO decisions
                  • <strong>Profit Sharing</strong>: 50% of basket contract profits distributed to holders
                  • <strong>Staking Rewards</strong>: 15-25% APY for staked tokens
                  • <strong>Deflationary</strong>: 20% of revenue used for token burns
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How many $ZIGMA tokens are there?</p>
                <p className="text-sm text-muted-foreground">
                  Total supply is 1,000,000,000 $ZIGMA tokens:
                  • <strong>80% (800M)</strong>: Available through fair launch on CyreneAI
                  • <strong>20% (200M)</strong>: Team allocation with 6-month cliff, 24-month vesting
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What is the fair launch date and price?</p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Date</strong>: January 28, 2026
                  • <strong>Platform</strong>: CyreneAI launchpad
                  • <strong>Initial Price</strong>: $0.005 per $ZIGMA
                  • <strong>Target Raise</strong>: $2,000,000 USD equivalent
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🎯 Platform Usage</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How much does it cost to use ZIGMA?</p>
                <p className="text-sm text-muted-foreground">
                  Costs vary by usage:
                  • <strong>Chat Analysis</strong>: 100 ZIGMA per bet + user analysis
                  • <strong>API Access</strong>: Based on tier (1,000-100,000 $ZIGMA required)
                  • <strong>Premium Features</strong>: Subscription-based (100-2,000 ZIGMA/month)
                  • <strong>Free Tier</strong>: Limited signals with 1-hour delay
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What is the chat feature?</p>
                <p className="text-sm text-muted-foreground">
                  The chat feature allows you to interact directly with our AI oracle to get personalized market analysis, trading recommendations, and insights. Each session costs 100 ZIGMA and includes analysis of one bet and user profile.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How accurate are ZIGMA's signals?</p>
                <p className="text-sm text-muted-foreground">
                  Our signals have historically achieved 68-72% accuracy rates. However, past performance doesn't guarantee future results. We provide confidence scores (0.1-1.0) to indicate signal reliability.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: Can I use ZIGMA for automated trading?</p>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer:
                  • <strong>API Access</strong>: For building custom trading bots
                  • <strong>SDK</strong>: Python and JavaScript libraries
                  • <strong>Basket Contract</strong>: Autonomous trading with profit sharing
                  • <strong>WebSockets</strong>: Real-time signal streaming
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔄 Basket Contract</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What is the ZIGMA Basket Contract?</p>
                <p className="text-sm text-muted-foreground">
                  The Basket Contract is an autonomous trading system that uses 50% of creator fees to execute trades across prediction markets. Profits are distributed 50% to $ZIGMA holders, 40% reinvested, and 10% to treasury.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: When does the Basket Contract launch?</p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Deployment</strong>: February 1, 2026
                  • <strong>First Payout</strong>: February 7, 2026
                  • <strong>Full Operation</strong>: March 15, 2026 (autonomous trading)
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How do I receive basket profits?</p>
                <p className="text-sm text-muted-foreground">
                  Simply hold $ZIGMA tokens in your wallet. Profits are automatically distributed to token holders based on their holdings. No staking required for basic profit sharing.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What are the expected returns?</p>
                <p className="text-sm text-muted-foreground">
                  We target 15-25% monthly returns on basket capital, but actual returns vary based on market conditions and signal performance.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📊 Technical & API</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What are the API rate limits?</p>
                <p className="text-sm text-muted-foreground">
                  Rate limits depend on your $ZIGMA holdings:
                  • <strong>Basic (1,000 ZIGMA)</strong>: 100 requests/minute, 10,000 monthly
                  • <strong>Pro (10,000 ZIGMA)</strong>: 1,000 requests/minute, 100,000 monthly
                  • <strong>Enterprise (100,000 ZIGMA)</strong>: 10,000 requests/minute, 1,000,000 monthly
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: Which programming languages are supported?</p>
                <p className="text-sm text-muted-foreground">
                  We provide official SDKs for:
                  • <strong>Python</strong>: `pip install zigma`
                  • <strong>JavaScript/Node.js</strong>: `npm install zigma-js`
                  • <strong>React</strong>: Component library available
                  • <strong>REST API</strong>: Compatible with any language
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: Is there a sandbox environment?</p>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer a complete sandbox environment at `https://sandbox-api.zigma.ai` with test data and no token requirements for development.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🏛️ Governance & DAO</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How does ZIGMA governance work?</p>
                <p className="text-sm text-muted-foreground">
                  ZIGMA uses a token-based governance system:
                  • <strong>Voting Power</strong>: 1 $ZIGMA = 1 vote
                  • <strong>Proposal Types</strong>: Protocol upgrades, fee changes, feature additions
                  • <strong>Quorum</strong>: Minimum 10% of total supply required
                  • <strong>Passing Threshold</strong>: Majority vote (&gt;50%) for standard proposals
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: When does the DAO launch?</p>
                <p className="text-sm text-muted-foreground">
                  The DAO and Treasury system launches on February 19, 2026, enabling community governance and decentralized decision-making.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How can I participate in governance?</p>
                <p className="text-sm text-muted-foreground">
                  1. Hold $ZIGMA tokens
                  2. Connect your wallet to the governance portal
                  3. Vote on active proposals
                  4. Submit your own proposals (100,000 $ZIGMA minimum)
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔒 Security & Trust</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: Is ZIGMA audited and secure?</p>
                <p className="text-sm text-muted-foreground">
                  Yes, we prioritize security:
                  • <strong>Smart Contract Audits</strong>: Multiple firm audits (CertiK, OpenZeppelin)
                  • <strong>Bug Bounty</strong>: Up to $250,000 rewards
                  • <strong>Insurance</strong>: Smart contract coverage
                  • <strong>Best Practices</strong>: Industry-standard security measures
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How do you protect user data?</p>
                <p className="text-sm text-muted-foreground">
                  We implement:
                  • <strong>GDPR Compliance</strong>: Full data privacy compliance
                  • <strong>Encryption</strong>: End-to-end encryption for sensitive data
                  • <strong>Minimal Data Collection</strong>: Only necessary data for service
                  • <strong>User Control</strong>: Data deletion and export options
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What happens if the platform gets hacked?</p>
                <p className="text-sm text-muted-foreground">
                  We have comprehensive protection:
                  • <strong>Multi-signature Wallets</strong>: Require multiple signatories
                  • <strong>Time-locked Functions</strong>: Delay for critical operations
                  • <strong>Insurance Coverage</strong>: Smart contract insurance
                  • <strong>Emergency Response</strong>: 24/7 security team
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📈 Investment & Returns</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What are the expected returns for $ZIGMA holders?</p>
                <p className="text-sm text-muted-foreground">
                  Returns come from multiple sources:
                  • <strong>Basket Profits</strong>: 50% of trading profits distributed
                  • <strong>Staking Rewards</strong>: 15-25% APY for staked tokens
                  • <strong>Token Appreciation</strong>: From platform growth and usage
                  • <strong>Deflation</strong>: Token burns reduce supply over time
                </p>
              </div>
              <div className="bg-gray-950 border border-red-500/20 p-6 rounded-2xl">
                <p className="text-lg text-red-200 font-semibold mb-3">Q: Is $ZIGMA a good investment?</p>
                <p className="text-sm text-muted-foreground">
                  $ZIGMA is a utility token, not an investment. While it has potential for appreciation due to platform growth and deflationary mechanics, it carries risks like any cryptocurrency. Please do your own research and consult financial advisors.
                </p>
              </div>
              <div className="bg-gray-950 border border-yellow-500/20 p-6 rounded-2xl">
                <p className="text-lg text-yellow-200 font-semibold mb-3">Q: What are the risks involved?</p>
                <p className="text-sm text-muted-foreground">
                  Key risks include:
                  • <strong>Market Volatility</strong>: Token price fluctuations
                  • <strong>Regulatory Changes</strong>: Crypto regulation evolution
                  • <strong>Competition</strong>: Other prediction market tools
                  • <strong>Technical Risk</strong>: Smart contract vulnerabilities
                  • <strong>Market Risk</strong>: Prediction market performance
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🌐 Platform Coverage</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: Which prediction markets does ZIGMA support?</p>
                <p className="text-sm text-muted-foreground">
                  We currently support:
                  • <strong>Polymarket</strong>: Decentralized prediction markets
                  • <strong>Kalshi</strong>: US-regulated prediction markets
                  • <strong>Jupiter</strong>: Solana DEX aggregator
                  • <strong>Raydium</strong>: Solana AMM
                  • <strong>Option Markets</strong>: DeFi options protocols
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: When will Kalshi integration be available?</p>
                <p className="text-sm text-muted-foreground">
                  Kalshi integration launches on April 20, 2026, adding 500+ US-regulated prediction markets to our coverage.
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: Will you add more platforms?</p>
                <p className="text-sm text-muted-foreground">
                  Yes! Our roadmap includes:
                  • <strong>Q3 2026</strong>: Additional DeFi protocols
                  • <strong>Q4 2026</strong>: Cross-chain compatibility
                  • <strong>2027</strong>: Traditional markets integration
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📞 Support & Contact</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How can I get help?</p>
                <p className="text-sm text-muted-foreground">
                  Multiple support channels:
                  • <strong>Documentation</strong>: https://docs.zigma.ai
                  • <strong>Discord Community</strong>: https://discord.gg/zigma
                  • <strong>Email Support</strong>: support@zigma.ai
                  • <strong>Status Page</strong>: https://status.zigma.ai
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: What are your support hours?</p>
                <p className="text-sm text-muted-foreground">
                  • <strong>24/7</strong>: Critical issues and security
                  • <strong>Business Hours</strong>: General support (9 AM - 6 PM UTC)
                  • <strong>Community</strong>: Discord support available 24/7
                </p>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Q: How do I report a bug or security issue?</p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Bugs</strong>: GitHub Issues or support@zigma.ai
                  • <strong>Security</strong>: security@zigma.ai (encrypted preferred)
                  • <strong>Bug Bounty</strong>: Up to $250,000 for critical vulnerabilities
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🎯 Quick Reference</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Important Dates</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Fair Launch: January 28, 2026</li>
                  <li>• Chat Access: January 31, 2026</li>
                  <li>• Basket Launch: February 1, 2026</li>
                  <li>• DAO Launch: February 19, 2026</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Key Numbers</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Total Supply: 1,000,000,000 $ZIGMA</li>
                  <li>• Initial Price: $0.005 per token</li>
                  <li>• Signal Accuracy: 68-72%</li>
                  <li>• Chat Cost: 100 ZIGMA per session</li>
                  <li> • API Tiers: 1,000-100,000 $ZIGMA required</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Essential Links</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Website: https://zigma.ai</li>
                  <li>• App: https://app.zigma.ai</li>
                  <li>• Docs: https://docs.zigma.ai</li>
                  <li>• Discord: https://discord.gg/zigma</li>
                  <li>• Twitter: https://twitter.com/ZigmaOracle</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🚀 Ready to Get Started?</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">New User Checklist</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ Create ZIGMA account</li>
                  <li>□ Connect Solana wallet</li>
                  <li>□ Purchase $ZIGMA tokens</li>
                  <li>□ Generate API key (if needed)</li>
                  <li>□ Explore the platform</li>
                  <li>□ Join Discord community</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Developer Checklist</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ Install SDK (Python/JavaScript)</li>
                  <li>□ Review API documentation</li>
                  <li>□ Test with sandbox environment</li>
                  <li>□ Implement error handling</li>
                  <li>□ Set up rate limiting</li>
                  <li>□ Join developer Discord</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="text-center py-8 border-t border-green-500/20">
            <p className="text-sm text-muted-foreground">
              ZIGMA FAQ v1.0 | Last Updated: January 2026
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Have more questions? Contact us at support@zigma.ai
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
