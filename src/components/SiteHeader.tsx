import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationSystem";
import SimpleUserProfile from "@/components/SimpleUserProfile";
import { useMagicAuth } from "@/contexts/MagicAuthContext";
import { LogIn, ChevronDown, BookOpen, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const primaryNavItems = [
  { label: "Home", to: "/" },
  { label: "Chat", to: "/chat" },
  { label: "Signals", to: "/signals" },
  { label: "Analytics", to: "/analytics" },
  { label: "Agent", to: "/agent" },
];

const docsLinks = [
  { label: "Documentation", to: "/docs" },
  { label: "Manifesto", to: "/manifesto" },
  { label: "FAQ", to: "/faq" },
];


const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useMagicAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-green-500/20 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 py-5 sm:py-6">
        <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-green-400">
          <img src="/logonobg.jpeg" alt="Zigma Logo" className="h-10 w-auto" />
          <span className="hidden sm:inline">ZIGMA</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="transition hover:text-green-300"
              activeClassName="text-green-400"
            >
              {item.label}
            </NavLink>
          ))}
          
          <span className="text-foreground/30">|</span>
          
          {/* Docs Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors">
              <BookOpen className="w-3 h-3" />
              <span>Docs</span>
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-black border-green-500/30">
              {docsLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <Link to={link.to} className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-green-300">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          <NotificationBell />
          {isAuthenticated && user ? (
            <SimpleUserProfile />
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-green-500/10 border border-green-400/60 text-green-200 hover:bg-green-500/20 text-[10px] uppercase tracking-[0.2em] px-4 py-2"
            >
              <Link to="/auth">
                <LogIn className="w-3 h-3 mr-2" />
                Login
              </Link>
            </Button>
          )}
          <a
            href="https://x.com/agentzigma"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-green-200 items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <Button
            asChild
            size="sm"
            className="bg-green-500/10 border border-green-400/60 text-green-200 hover:bg-green-500/20 text-[10px] uppercase tracking-[0.2em] px-4 py-2"
          >
            <Link to="/chat">Chat</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-green-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-green-500/20 bg-black/95">
          <div className="px-6 py-4 space-y-3">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="block py-2 text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-green-300"
                activeClassName="text-green-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="border-t border-green-500/20 pt-3 mt-3">
              <div className="text-[10px] uppercase tracking-wider text-green-400/60 mb-2">Docs</div>
              {docsLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="block py-2 text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-green-300"
                  activeClassName="text-green-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
