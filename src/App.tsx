import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { NotificationProvider } from "@/components/NotificationSystem";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Manifesto from "./pages/Manifesto";
import Logs from "./pages/Logs";
import Docs from "./pages/Docs";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import SignalPerformance from "./pages/SignalPerformance";
import Backtesting from "./pages/Backtesting";
import Watchlist from "./pages/Watchlist";
import DataVisualization from "./pages/DataVisualization";
import Settings from "./pages/Settings";
import PaperTrading from "./pages/PaperTrading";
import NotFound from "./pages/NotFound";
import { useKeyboardShortcuts } from "./utils/keyboard-shortcuts";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  useKeyboardShortcuts({
    'Alt+h': () => navigate('/'),
    'Alt+m': () => navigate('/manifesto'),
    'Alt+a': () => navigate('/analytics'),
    'Alt+s': () => navigate('/signals'),
    'Alt+b': () => navigate('/backtesting'),
    'Alt+w': () => navigate('/watchlist'),
    'Alt+v': () => navigate('/visualization'),
    'Alt+l': () => navigate('/logs'),
    'Alt+d': () => navigate('/docs'),
    'Alt+c': () => navigate('/chat'),
    'Alt+r': () => window.location.reload(),
  });

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/manifesto" element={<Manifesto />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/signals" element={<SignalPerformance />} />
      <Route path="/backtesting" element={<Backtesting />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/visualization" element={<DataVisualization />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/paper-trading" element={<PaperTrading />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/chat" element={<Chat />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
