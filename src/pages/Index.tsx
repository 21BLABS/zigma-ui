import Hero from "@/components/Hero";
import OracleLogic from "@/components/OracleLogic";
import SignalPhilosophy from "@/components/SignalPhilosophy";
import SampleSignal from "@/components/SampleSignal";
import Differentiators from "@/components/Differentiators";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Scanline overlay */}
      <div className="scanline" />
      
      <Hero />
      <OracleLogic />
      <SignalPhilosophy />
      <SampleSignal />
      <Differentiators />
      <TokenUtility />
      <Footer />
    </div>
  );
};

export default Index;
