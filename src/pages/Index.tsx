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
      {/* CRT Effects */}
      <div className="crt-glow" />
      <div className="crt-vignette" />
      <div className="crt-flicker" />
      <div className="scanline" />
      
      {/* Glitch Effects */}
      <div className="glitch-container">
        <div className="glitch-effect" />
        <div className="glitch-rgb" />
        <div className="glitch-lines" />
        <div className="glitch-noise" />
      </div>
      
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
