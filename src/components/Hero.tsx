import { useEffect, useState } from "react";

const Hero = () => {
  const [showCursor, setShowCursor] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBootComplete(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 py-20">
      <div className="container max-w-4xl">
        {/* Boot sequence */}
        <div className="mb-8 text-xs text-muted-foreground">
          <p>[BOOT] Initializing prediction oracle...</p>
          <p>[BOOT] Loading market feeds...</p>
          <p className={bootComplete ? "opacity-100" : "opacity-0"}>
            [BOOT] System ready.
          </p>
        </div>

        {/* Main headline */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-primary glow-text mb-2">
            AGENT ZIGMA
          </h1>
          <p className="text-lg md:text-xl text-secondary">
            Prediction Market Oracle
          </p>
        </div>

        {/* Subtext */}
        <div className="mb-12 text-muted-foreground text-sm md:text-base">
          <p>Detects structural edge.</p>
          <p>Remains silent otherwise.</p>
        </div>

        {/* Status block */}
        <div className="terminal-box mb-12 max-w-md">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SYSTEM STATUS:</span>
              <span className="text-primary">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MODE:</span>
              <span className="text-accent">NO_TRADE_DEFAULT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MARKETS MONITORED:</span>
              <span className="text-primary">500+</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#signal" className="terminal-btn inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            VIEW LIVE SIGNAL LOG
          </a>
          <a href="#manifesto" className="terminal-btn-secondary inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            READ MANIFESTO
          </a>
        </div>

        {/* Blinking cursor */}
        <div className="mt-16 text-muted-foreground text-sm">
          <span>zigma@oracle:~$ </span>
          <span className="blink">_</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
