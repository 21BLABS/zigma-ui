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

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">CONTRACT ADDRESS</p>
                <p className="text-xs font-mono text-green-400">xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai</p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText('xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai')}
                className="text-xs bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-1 rounded hover:bg-green-600/30 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <a 
              href="https://cyreneai.com/trade/zigma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Buy ZIGMA Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenUtility;
