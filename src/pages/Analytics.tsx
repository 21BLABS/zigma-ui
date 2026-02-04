import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ResolvedSignals from "@/components/ResolvedSignals";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      
      <main className="container mx-auto px-6 sm:px-8 py-8 max-w-7xl">
        {/* Historical Performance Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Historical Performance - Track Record</h1>
          <p className="text-sm sm:text-base text-green-300/60 mb-8">Verified wins from manually tracked trades</p>
          <ResolvedSignals />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
