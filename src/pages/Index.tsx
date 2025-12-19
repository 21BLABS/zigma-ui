import Hero from "@/components/Hero";
import Manifesto from "@/components/OracleLogic";
import LatestSignal from "@/components/LatestSignal";
import AntiAIManifesto from "@/components/SignalPhilosophy";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";
import { LogsDisplay } from "@/components/LogsDisplay";
import { useState } from "react";

const Index = () => {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Subtle CRT Effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8">
        <Hero />
        <Manifesto />
        <div className="text-center">
          <button
            onClick={() => setShowLogs(true)}
            className="px-6 py-2 bg-green-600 text-black font-bold hover:bg-green-500 transition-colors"
          >
            VIEW LIVE SIGNAL LOG
          </button>
        </div>
        <LatestSignal />
        <AntiAIManifesto />
        <TokenUtility />

        {showLogs && (
          <section className="bg-black border border-green-400 p-4">
            <LogsDisplay />
            <button
              onClick={() => setShowLogs(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white hover:bg-red-500"
            >
              CLOSE LOG
            </button>
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Index;
