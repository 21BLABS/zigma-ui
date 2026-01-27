import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, BookOpen, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Footer = () => {
  const links = [
    { label: "X", href: "https://x.com/agentzigma" },
    { label: "", href: "https://t.me/agentzigma", icon: true },
  ];

  const pageLinks = [
    { label: "Analytics", to: "/analytics", disabled: false },
    { label: "Signals", to: "/signals", disabled: false },
    { label: "Basket", to: "/basket", disabled: true },
    { label: "ZIGMA Token", to: "/zigma", disabled: false },
  ];

  const docsLinks = [
    { label: "Documentation", to: "/docs" },
    { label: "API Documentation", to: "/api-documentation" },
    { label: "SDK Guide", to: "/sdk-guide" },
    { label: "User Guide", to: "/user-guide" },
    { label: "Manifesto", to: "/manifesto" },
    { label: "FAQ", to: "/faq" },
  ];

const otherLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-of-service" },
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
            
            {/* Docs Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 terminal-link text-green-400">
                <BookOpen className="w-3 h-3" />
                <span>Docs</span>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-black border-green-500/30">
                {docsLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to} className="text-xs uppercase tracking-[0.15em]">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
