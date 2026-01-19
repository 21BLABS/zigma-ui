import { Link } from "react-router-dom";

const Footer = () => {
  const links = [
    { label: "X", href: "https://x.com/agentzigma" },
    { label: "Telegram", href: "https://t.me/agentzigma" },
  ];

  const pageLinks = [
    { label: "Analytics", to: "/analytics", disabled: true },
    { label: "Signals", to: "/signals" },
    { label: "Backtesting", to: "/backtesting", disabled: true },
    { label: "Visualization", to: "/visualization", disabled: true },
    { label: "Paper Trading", to: "/paper-trading", disabled: true },
    { label: "Watchlist", to: "/watchlist", disabled: true },
  ];

  const publicLinks = [
    { label: "Docs", to: "/docs" },
  ];

  return (
    <>
      <footer className="py-16 px-4 sm:px-6 border-t border-border">
        <div className="container max-w-5xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-green-400">
              <img src="/logonobg.jpeg" alt="Zigma Logo" className="h-8 w-auto" />
              <span>ZIGMA.PRO</span>
            </Link>
            <p className="text-muted-foreground text-sm mt-2">
              An independent market oracle.
            </p>
          </div>

          <div className="mb-8 text-sm text-muted-foreground space-y-1">
            <p>DO NOT TRADE BASED ON HYPE.</p>
            <p>VERIFY EVERYTHING.</p>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs uppercase tracking-[0.15em]">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="terminal-link"
              >
                {link.label}
              </a>
            ))}
            {pageLinks.map((link) => (
              link.disabled ? (
                <span key={link.label} className="text-yellow-400/60 cursor-not-allowed">
                  {link.label}
                </span>
              ) : (
                <Link key={link.label} to={link.to} className="terminal-link">
                  {link.label}
                </Link>
              )
            ))}
            {publicLinks.map((link) => (
              <Link key={link.label} to={link.to} className="terminal-link">
                {link.label}
              </Link>
            ))}
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
