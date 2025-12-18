const SignalPhilosophy = () => {
  const statusBadges = [
    { label: "NO_TRADE", variant: "warning" },
    { label: "EDGE INSUFFICIENT", variant: "warning" },
    { label: "LIQUIDITY FAIL", variant: "error" },
    { label: "VOLATILITY LOCK", variant: "warning" },
  ];

  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="container max-w-4xl">
        <div className="terminal-box">
          <p className="text-lg md:text-xl font-bold text-primary mb-6">
            MOST MARKETS DO NOT DESERVE A TRADE.
          </p>
          
          <div className="mb-8 text-sm md:text-base space-y-1">
            <p className="text-muted-foreground mb-2">ZIGMA SPEAKS ONLY WHEN:</p>
            <p>- Edge survives uncertainty</p>
            <p>- Liquidity is real</p>
            <p>- Time decay is acceptable</p>
            <p>- Entropy is discounted</p>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {statusBadges.map((badge) => (
              <span
                key={badge.label}
                className={`status-badge ${
                  badge.variant === "warning"
                    ? "status-badge-warning"
                    : "status-badge-error"
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignalPhilosophy;
