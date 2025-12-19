const LatestSignal = () => {
  return (
    <section className="border border-green-400 p-4">
      <p className="text-sm text-green-400 mb-4">
        Below is a recent qualifying signal from the last cycle.
      </p>
      <div className="text-green-400 mb-4">[ LATEST SIGNAL OUTPUT ]</div>

      <div className="font-mono text-sm space-y-3">
        <div>
          <span className="text-muted-foreground">MARKET: </span>
          <span>Russia x Ukraine ceasefire in 2025?</span>
        </div>

        <div className="border-t border-green-400 pt-3 space-y-1">
          <div>
            <span className="text-muted-foreground">MARKET ODDS: </span>
            <span>3.2%</span>
          </div>
          <div>
            <span className="text-green-400">ZIGMA ODDS: </span>
            <span className="text-yellow-400">25.0%</span>
          </div>
        </div>

        <div className="border-t border-green-400 pt-3 space-y-1">
          <div>
            <span className="text-muted-foreground">EFFECTIVE EDGE: </span>
            <span className="text-green-400">+21.8%</span>
          </div>
          <div>
            <span className="text-muted-foreground">ENTROPY PENALTY: </span>
            <span className="text-red-400">-0.5%</span>
          </div>
          <div>
            <span className="text-muted-foreground">LIQUIDITY: </span>
            <span className="text-green-400">PASS</span>
          </div>
        </div>

        <div className="border-t border-green-400 pt-3 space-y-1">
          <div>
            <span className="text-muted-foreground">CONVICTION: </span>
            <span className="text-yellow-400">B</span>
          </div>
          <div>
            <span className="text-muted-foreground">ACTION: </span>
            <span className="text-green-400 font-bold">BUY YES</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        NOTE: Signals are rare by design. This shows recent BUY activity.
      </p>
    </section>
  );
};

export default LatestSignal;
