import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">Legal · Effective January 28, 2026</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / TERMS OF SERVICE</p>
            <h1 className="text-4xl font-bold text-white leading-tight">ZIGMA Terms of Service</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Welcome to ZIGMA. These Terms of Service govern your use of our AI-powered prediction market intelligence platform. By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Effective Date</p>
              <p className="text-2xl font-semibold text-green-200 mt-2">January 28, 2026</p>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">Agreement to Terms</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <p className="text-green-200 font-semibold">Welcome to ZIGMA</p>
              <p className="text-sm text-muted-foreground">
                ZIGMA ("Platform," "We," "Us," or "Our") is an AI-powered prediction market intelligence platform. These Terms of Service ("Terms") govern your use of our website, mobile applications, API services, and related services (collectively, the "Service").
              </p>
              <p className="text-sm text-muted-foreground">
                By accessing or using our Service, you agree to be bound by these Terms, our Privacy Policy, and any additional terms incorporated by reference. If you do not agree to these Terms, you may not access or use our Service.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">Age Requirements</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground">
                You must be at least 18 years of age or the legal age of majority in your jurisdiction to use our Service. By using our Service, you represent and warrant that you meet this age requirement.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">Description of Service</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">🚀 Platform Features</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Market analysis and signals</li>
                  <li>• AI-powered chat functionality</li>
                  <li>• Portfolio tracking tools</li>
                  <li>• API access for developers</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-3">
                <p className="text-lg text-green-200 font-semibold">💰 Utility Token</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• $ZIGMA utility token</li>
                  <li>• Platform access and governance</li>
                  <li>• Not a security or investment</li>
                  <li>• 1B total supply on Solana</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">AI Services and Signals</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">🤖 Signal Accuracy</p>
                  <p className="text-sm text-muted-foreground">
                    While we strive for accuracy, our AI-generated signals are based on available data and algorithms, carry no guarantee of correctness, and should not be considered financial advice.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">💬 Chat Services</p>
                  <p className="text-sm text-muted-foreground">
                    AI chat responses are generated by machine learning models, may contain errors or inaccuracies, should be verified independently, and cost 100 ZIGMA per session.
                  </p>
                </div>
              </div>
              <div className="border-t border-green-500/20 pt-4">
                <p className="text-xs text-yellow-400 uppercase tracking-[0.3em]">⚠️ No Financial Advice</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our Service does not provide personalized investment advice, financial recommendations, tax or legal guidance, or professional financial counseling.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">Risks and Disclaimers</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-red-500/20 p-4 rounded-xl">
                <p className="text-lg text-red-200 font-semibold mb-2">📈 Market Risks</p>
                <p className="text-xs text-muted-foreground">
                  High volatility, potential loss of entire investment, liquidity risks, regulatory uncertainties
                </p>
              </div>
              <div className="bg-gray-950 border border-red-500/20 p-4 rounded-xl">
                <p className="text-lg text-red-200 font-semibold mb-2">🔧 Technical Risks</p>
                <p className="text-xs text-muted-foreground">
                  Software bugs, network issues, smart contract vulnerabilities, cybersecurity threats
                </p>
              </div>
              <div className="bg-gray-950 border border-red-500/20 p-4 rounded-xl">
                <p className="text-lg text-red-200 font-semibold mb-2">🤖 AI Limitations</p>
                <p className="text-xs text-muted-foreground">
                  Incorrect outputs, biased analysis, technical failures, requires human oversight
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">🔐 Wallet Security</p>
                  <p className="text-sm text-muted-foreground">
                    You are solely responsible for securing your private keys, safeguarding your $ZIGMA tokens, authorizing transactions, and backup/recovery of wallet access.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-green-200 font-semibold mb-3">🚫 Prohibited Activities</p>
                  <p className="text-sm text-muted-foreground">
                    You may not use the Service for illegal purposes, attempt to compromise platform security, manipulate markets or signals, share account credentials, or violate applicable laws.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">Fees and Payments</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-200">100</p>
                  <p className="text-xs text-muted-foreground">ZIGMA per AI chat session</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-200">API</p>
                  <p className="text-xs text-muted-foreground">Access based on holding requirements</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-200">1:1</p>
                  <p className="text-xs text-muted-foreground">Token to vote ratio in governance</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                All payments are made in $ZIGMA tokens. Transactions are irreversible on blockchain. No refunds for token-based services.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">Acknowledgment</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground">
                By using ZIGMA, you acknowledge that you have read and understood these Terms, agree to be bound by these Terms, understand the risks involved, are not relying on any promises or guarantees, and use the Service at your own risk.
              </p>
            </div>
          </section>

          <footer className="text-center py-8 border-t border-green-500/20">
            <p className="text-xs text-muted-foreground">
              ZIGMA Terms of Service v1.0 | Effective: January 28, 2026
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Thank you for choosing ZIGMA. We look forward to providing you with valuable prediction market intelligence and services.
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
