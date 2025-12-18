const OracleLogic = () => {
  return (
    <section id="manifesto" className="py-20 px-4">
      <div className="container max-w-4xl">
        {/* Core Logic Block */}
        <div className="terminal-box mb-8">
          <div className="terminal-header">[ ZIGMA CORE LOGIC ]</div>
          <div className="space-y-2 text-sm md:text-base">
            <p>• Scans prediction markets</p>
            <p>• Computes canonical probabilities in code</p>
            <p>• Consumes evidence, not opinions</p>
            <p>• Outputs delta only</p>
            <p>• Rejects noise</p>
            <p>• Defaults to NO_TRADE</p>
          </div>
        </div>

        {/* What Zigma is NOT */}
        <div className="terminal-box border-destructive/30">
          <div className="terminal-header text-destructive">ZIGMA IS NOT:</div>
          <div className="space-y-2 text-sm md:text-base text-muted-foreground">
            <p>- A trading bot</p>
            <p>- A signal spammer</p>
            <p>- A probability generator</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OracleLogic;
