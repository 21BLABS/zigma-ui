const SampleSignal = () => {
  return (
    <section id="signal" className="py-20 px-4 border-t border-border">
      <div className="container max-w-4xl">
        <div className="terminal-header mb-4">[ SAMPLE SIGNAL OUTPUT ]</div>
        
        <div className="terminal-box font-mono text-sm md:text-base">
          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground">MARKET: </span>
              <span>Weed rescheduled in 2025?</span>
            </div>
            
            <div className="border-t border-border pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">MARKET ODDS: </span>
                <span>4.45%</span>
              </div>
              <div>
                <span className="text-muted-foreground">ZIGMA ODDS: </span>
                <span className="text-primary">18.9%</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">EFFECTIVE EDGE: </span>
                <span className="text-primary">+14.45%</span>
              </div>
              <div>
                <span className="text-muted-foreground">ENTROPY PENALTY: </span>
                <span className="text-destructive">-3.1%</span>
              </div>
              <div>
                <span className="text-muted-foreground">LIQUIDITY: </span>
                <span className="text-primary">PASS</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">CONVICTION: </span>
                <span className="text-accent">B</span>
              </div>
              <div>
                <span className="text-muted-foreground">ACTION: </span>
                <span className="text-primary font-bold">BUY YES</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          NOTE: Signals are rare by design.
        </p>
      </div>
    </section>
  );
};

export default SampleSignal;
