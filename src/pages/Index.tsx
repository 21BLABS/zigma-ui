import Hero from "@/components/Hero";
import AntiAIManifesto from "@/components/SignalPhilosophy";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('zigma-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('zigma-tutorial-seen', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      
      <main className="p-4">
        {/* Subtle CRT Effects */}
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Core Philosophy */}
          <div className="space-y-8">
            <Hero />
            <AntiAIManifesto />
            <TokenUtility />
          </div>

          {/* Right Panel: Action CTAs */}
          <div className="space-y-8">
            {/* Primary CTA - Chat */}
            <div className="rounded-2xl border border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent p-6 text-left shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <p className="text-xs uppercase tracking-[0.4em] text-green-300">Live interrogation</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Tap the oracle directly.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Paste any Polymarket link. Zigma hydrates the book, checks news flow, and returns a BUY/SELL/HOLD with reasoning.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-black/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-green-200 hover:bg-green-400/10"
                >
                  Launch chat
                </Link>
                <Link
                  to="/signals"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/60 bg-blue-600/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 hover:bg-blue-400/20"
                >
                  View Signals
                </Link>
                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-600/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200 hover:bg-purple-400/20"
                >
                  Analytics
                </Link>
              </div>
            </div>

            {/* Roadmap Section */}
            <div className="bg-black/60 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                🗺️ ROADMAP
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-white">Oracle + Chat + Analytics</p>
                    <p className="text-xs text-gray-400">Live now | Real-time market intelligence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">🚀</span>
                  <div>
                    <p className="font-semibold text-yellow-400">Zigma Basket Auto-Trading</p>
                    <p className="text-xs text-gray-400">February 5, 2026 | Automated signal execution</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl">📱</span>
                  <div>
                    <p className="font-semibold text-blue-400">Molt Integration</p>
                    <p className="text-xs text-gray-400">Q1 2026 | Trade via WhatsApp, Telegram, Discord, X</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 text-xl">🤖</span>
                  <div>
                    <p className="font-semibold text-purple-400">Developer API</p>
                    <p className="text-xs text-gray-400">Q2 2026 | Build custom agents with Zigma intelligence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4">⚙️ HOW IT WORKS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-black/40 rounded-lg">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="font-semibold text-white mb-1">1. Scan Markets</p>
                  <p className="text-xs text-gray-400">1,000+ markets analyzed per cycle</p>
                </div>
                <div className="text-center p-4 bg-black/40 rounded-lg">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="font-semibold text-white mb-1">2. Filter for Edge</p>
                  <p className="text-xs text-gray-400">Only signals with real edge</p>
                </div>
                <div className="text-center p-4 bg-black/40 rounded-lg">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="font-semibold text-white mb-1">3. Execute Trades</p>
                  <p className="text-xs text-gray-400">With confirmed advantage</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-black/60 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">🔗 QUICK LINKS</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/chat"
                  className="text-center p-3 bg-green-900/20 border border-green-500/30 rounded-lg hover:bg-green-900/30 transition-all"
                >
                  <div className="text-2xl mb-1">💬</div>
                  <p className="text-sm font-semibold text-green-400">Chat</p>
                </Link>
                <Link
                  to="/signals"
                  className="text-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 transition-all"
                >
                  <div className="text-2xl mb-1">📊</div>
                  <p className="text-sm font-semibold text-blue-400">Signals</p>
                </Link>
                <Link
                  to="/analytics"
                  className="text-center p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg hover:bg-purple-900/30 transition-all"
                >
                  <div className="text-2xl mb-1">📈</div>
                  <p className="text-sm font-semibold text-purple-400">Analytics</p>
                </Link>
                <Link
                  to="/manifesto"
                  className="text-center p-3 bg-gray-900/20 border border-gray-500/30 rounded-lg hover:bg-gray-900/30 transition-all"
                >
                  <div className="text-2xl mb-1">📜</div>
                  <p className="text-sm font-semibold text-gray-400">Manifesto</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default Index;
