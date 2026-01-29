const TokenUtility = () => {
  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="container max-w-4xl">
        <p className="text-sm text-muted-foreground mb-6">
          ZIGMA can exist without a token. The token exists to ration access.
        </p>
        <div className="terminal-box">
          <div className="terminal-header">ZIGMA TOKEN UTILITY:</div>
          
          <div className="space-y-2 text-sm md:text-base mb-6">
            <p>• Burn to unlock premium signal feeds</p>
            <p>• Burn for historical audit access</p>
            <p>• Burn for API rate expansion</p>
            <p>• Burn for advanced analytics</p>
          </div>

          <div className="border-t border-border pt-4 space-y-1 text-muted-foreground text-sm">
            <p>No yield.</p>
            <p>No promises.</p>
            <p>Usage aligned.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenUtility;
