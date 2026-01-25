import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">User Guide • Version 1.0</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / USER GUIDE</p>
            <h1 className="text-4xl font-bold text-white leading-tight">ZIGMA User Guide</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Complete guide to using ZIGMA Platform - your AI-powered prediction market intelligence platform. Learn how to navigate features, understand signals, and maximize your trading experience.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Signal Accuracy</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">68-72%</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Chat Cost</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">100 ZIGMA</p>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Min API Holding</p>
                <p className="text-2xl font-semibold text-green-200 mt-2">1,000 ZIGMA</p>
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
                <p className="text-lg text-green-200 font-semibold">Step 1: Create Account</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visit app.zigma.ai</li>
                  <li>• Sign up with email or social</li>
                  <li>• Verify email address</li>
                  <li>• Complete your profile</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Step 2: Connect Wallet</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Prepare Solana wallet</li>
                  <li>• Click "Connect Wallet"</li>
                  <li>• Authorize connection</li>
                  <li>• Verify address display</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Step 3: Get $ZIGMA</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fair launch: Jan 28, 2026</li>
                  <li>• Exchanges: After May 2, 2026</li>
                  <li>• DEX: Jupiter/Raydium</li>
                  <li>• Min: 1,000 ZIGMA</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Step 4: Explore Dashboard</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Active signals</li>
                  <li>• Portfolio performance</li>
                  <li>• Market overview</li>
                  <li>• Recent activity</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🎯 Understanding Signals</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🟢</span>
                  </div>
                  <p className="text-lg text-green-200 font-semibold">High Confidence</p>
                  <p className="text-xs text-muted-foreground">0.8+ confidence</p>
                  <p className="text-xs text-muted-foreground mt-1">Strong analytical foundation</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🟡</span>
                  </div>
                  <p className="text-lg text-yellow-200 font-semibold">Medium Confidence</p>
                  <p className="text-xs text-muted-foreground">0.6-0.8 confidence</p>
                  <p className="text-xs text-muted-foreground mt-1">Good analytical basis</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔴</span>
                  </div>
                  <p className="text-lg text-red-200 font-semibold">Low Confidence</p>
                  <p className="text-xs text-muted-foreground">0.4-0.6 confidence</p>
                  <p className="text-xs text-muted-foreground mt-1">Limited supporting data</p>
                </div>
              </div>
              <div className="border-t border-green-500/20 pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Signal Components:</strong> Direction (YES/NO) • Probability (0-1) • Edge • Confidence • Position Size • Rationale
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">💬 AI Chat Feature</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Chat Features</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Market analysis</li>
                    <li>• Personal trading advice</li>
                    <li>• Strategy discussion</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Usage Details</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Cost: 100 ZIGMA per session</li>
                    <li>• Includes: 1 market analysis + profile</li>
                    <li>• Duration: Unlimited conversation</li>
                    <li>• Access: Via sidebar navigation</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
                <p className="text-xs text-green-300 uppercase tracking-[0.3em] mb-2">Example Questions</p>
                <div className="grid gap-2 md:grid-cols-2 text-xs text-muted-foreground">
                  <div>"What's your analysis of the BTC price prediction?"</div>
                  <div>"Based on my profile, should I take this trade?"</div>
                  <div>"What's the optimal position size for me?"</div>
                  <div>"How should I adjust my portfolio?"</div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📊 Portfolio Management</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Performance Metrics</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Total return & win rate</li>
                  <li>• Average edge & Sharpe ratio</li>
                  <li>• Maximum drawdown</li>
                  <li>• Performance attribution</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">Risk Management</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Position sizing calculator</li>
                  <li>• Correlation analysis</li>
                  <li>• Stop-loss settings</li>
                  <li>• Portfolio-wide limits</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔄 Basket Contract</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-200">50%</p>
                  <p className="text-xs text-muted-foreground">Creator fees for trading</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-200">50%</p>
                  <p className="text-xs text-muted-foreground">Profits to token holders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-200">40%</p>
                  <p className="text-xs text-muted-foreground">Reinvested for growth</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Simply hold $ZIGMA tokens to participate. Profits distributed automatically.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🏛️ Governance</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Voting Rights</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 1 $ZIGMA = 1 Vote</li>
                    <li>• 7-day voting period</li>
                    <li>• 10% quorum requirement</li>
                    <li>• Direct democracy</li>
                  </ul>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Proposal Types</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Protocol upgrades</li>
                    <li>• Financial decisions</li>
                    <li>• Community initiatives</li>
                    <li>• Governance rules</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">💰 Costs & Pricing</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Usage Costs</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chat Sessions</span>
                    <span className="text-green-200">100 ZIGMA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Basic API</span>
                    <span className="text-green-200">1,000 ZIGMA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pro API</span>
                    <span className="text-green-200">10,000 ZIGMA</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Premium Tiers</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Basic</span>
                    <span className="text-green-200">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pro</span>
                    <span className="text-green-200">100 ZIGMA/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Premium</span>
                    <span className="text-green-200">500 ZIGMA/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🛠️ Troubleshooting</h2>
            </div>
            <div className="bg-gray-950 border border-red-500/20 p-6 rounded-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-red-200 font-semibold mb-3">Common Issues</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Signal not appearing</li>
                    <li>• Chat session not starting</li>
                    <li>• Portfolio sync issues</li>
                    <li>• Performance data missing</li>
                  </ul>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">Support Channels</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email: support@zigma.ai</li>
                    <li>• Discord: discord.gg/zigma</li>
                    <li>• Twitter: @ZigmaOracle</li>
                    <li>• Priority: Premium tiers</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🎯 Quick Reference</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Important Links</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• app.zigma.ai</li>
                    <li>• docs.zigma.ai</li>
                    <li>• status.zigma.ai</li>
                    <li>• zigma.ai/whitepaper</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Key Dates</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Fair Launch: Jan 28, 2026</li>
                    <li>• Chat Access: Jan 31, 2026</li>
                    <li>• Basket Launch: Feb 1, 2026</li>
                    <li>• DAO Launch: Feb 19, 2026</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Essential Numbers</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Chat: 100 ZIGMA/session</li>
                    <li>• Min API: 1,000 ZIGMA</li>
                    <li>• Accuracy: 68-72%</li>
                    <li>• Basket Target: 15-25%/mo</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🚀 Ready to Start?</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">New User Checklist</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ Create account and verify email</li>
                  <li>□ Connect Solana wallet</li>
                  <li>□ Purchase $ZIGMA tokens</li>
                  <li>□ Explore the dashboard</li>
                  <li>□ Try first chat session</li>
                  <li>□ Review active signals</li>
                  <li>□ Set up portfolio tracking</li>
                  <li>□ Join Discord community</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Power User Checklist</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ Set up API access</li>
                  <li>□ Configure custom alerts</li>
                  <li>□ Participate in governance</li>
                  <li>□ Optimize signal usage</li>
                  <li>□ Track performance metrics</li>
                  <li>□ Contribute to community</li>
                  <li>□ Provide feedback</li>
                  <li>□ Help new users</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="text-center py-8 border-t border-green-500/20">
            <p className="text-lg text-green-200 font-semibold mb-2">Welcome to ZIGMA - The Silent Oracle!</p>
            <p className="text-sm text-muted-foreground">
              We're excited to have you join our community of prediction market traders. Whether you're a beginner or experienced trader, ZIGMA provides the tools and insights you need to succeed.
            </p>
            <p className="text-lg text-green-200 mt-4">Happy Trading! 🚀</p>
            <p className="text-xs text-muted-foreground mt-4">
              ZIGMA User Guide v1.0 | Last Updated: January 2026
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserGuide;
