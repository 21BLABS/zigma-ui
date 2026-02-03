import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Zap, 
  User, 
  BarChart3, 
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useMagicAuth } from "@/contexts/MagicAuthContext";

interface NavItem {
  label: string;
  to: string;
  icon: any;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Skills", to: "/skills", icon: Zap },
  { label: "Agent", to: "/agent/dashboard", icon: User },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Markets", to: "/signals", icon: TrendingUp },
];

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useMagicAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mock user data - replace with real data from context/API
  const userTier = 'PRO';
  const zigmaBalance = 15000;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 text-green-400"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-black border-r border-green-500/20 transition-all duration-300 z-40",
          "flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-green-500/20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white tracking-wider">ZIGMA</h1>
                <p className="text-xs text-green-300/60">AI Trading Platform</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  "text-sm font-medium",
                  active
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "text-green-300/60 hover:text-green-300 hover:bg-green-500/5",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {isAuthenticated && !isCollapsed && (
          <div className="p-4 border-t border-green-500/20 space-y-3">
            <div className="bg-gray-950 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-300/60">Tier</span>
                <Badge className="bg-purple-500 text-white text-xs">
                  {userTier}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-300/60">Balance</span>
                <span className="text-sm font-semibold text-white">
                  {zigmaBalance.toLocaleString()} $ZIGMA
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                asChild
              >
                <Link to="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-4 border-t border-green-500/20 text-green-300/60 hover:text-green-300 transition-colors"
        >
          <Menu className="w-5 h-5 mx-auto" />
        </button>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
