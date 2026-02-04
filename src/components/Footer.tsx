import { Link } from "react-router-dom";
import { useState } from "react";
import { Send } from "lucide-react";

const Footer = () => {
  const links = [
    { label: "X", href: "https://x.com/agentzigma" },
    { label: "", href: "https://t.me/agentzigma", icon: true },
  ];

  const pageLinks = [
    { label: "Analytics", to: "/analytics", disabled: false },
    { label: "Leaderboard", to: "/leaderboard", disabled: false },
    { label: "Signals", to: "/signals", disabled: false },
    { label: "Skills", to: "/skills", disabled: false },
  ];

const otherLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-of-service" },
];

  return (
    <>
      <footer className="py-20 px-6 sm:px-8 border-t border-border">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-green-400">
              <img src="/logonobg.jpeg" alt="Zigma Logo" className="h-10 w-auto" />
              <span>ZIGMA.PRO</span>
            </Link>
            <p className="text-muted-foreground text-sm mt-3">
              An independent market oracle.
            </p>
          </div>

          <div className="mb-10 text-sm text-muted-foreground space-y-2">
            <p>DO NOT TRADE BASED ON HYPE.</p>
            <p>VERIFY EVERYTHING.</p>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 text-xs uppercase tracking-[0.15em]">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="terminal-link flex items-center gap-1"
              >
                {link.icon && <Send className="w-3 h-3" />}
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
            
            {otherLinks.map((link) => (
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
