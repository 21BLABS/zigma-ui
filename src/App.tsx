import * as React from "react";
import LoadingFallback from "./components/LoadingFallback";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { NotificationProvider as OldNotificationProvider } from "@/components/NotificationSystem";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MagicAuthProvider } from "@/contexts/MagicAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MagicAuth from "./components/MagicAuth";
import Index from "./pages/Index";
import Manifesto from "./pages/Manifesto";
import Logs from "./pages/Logs";
import Docs from "./pages/Docs";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import SignalPerformance from "./pages/SignalPerformance";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import TradingDashboard from "./pages/TradingDashboard";
import { NotificationBell } from "./components/NotificationBell";
import { useKeyboardShortcuts } from "./utils/keyboard-shortcuts";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  useKeyboardShortcuts({
    'Alt+h': () => navigate('/'),
    'Alt+a': () => navigate('/analytics'),
    'Alt+s': () => navigate('/signals'),
    'Alt+w': () => navigate('/settings'),
    'Alt+l': () => navigate('/logs'),
    'Alt+d': () => navigate('/docs'),
    'Alt+k': () => navigate('/sdk-guide'),
    'Alt+g': () => navigate('/user-guide'),
    'Alt+f': () => navigate('/faq'),
    'Alt+?': () => navigate('/api-documentation'),
    'Escape': () => navigate('/'),
    'Alt+t': () => navigate('/terms-of-service'),
    'Alt+n': () => navigate('/notifications'),
    'Alt+r': () => window.location.reload(),
    'Alt+p': () => navigate('/trading'),
    'Alt+y': () => navigate('/strategies'),
    'Alt+m': () => navigate('/wallets'),
  });

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<MagicAuth />} />
      <Route path="/manifesto" element={<Manifesto />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/faq" element={<FAQ />} />
      
      {/* Protected Routes */}
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/signals" element={
        <ProtectedRoute>
          <SignalPerformance />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute>
          <Logs />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/agent" element={
        <ProtectedRoute>
          <TradingDashboard />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/notification-settings" element={
        <ProtectedRoute>
          <NotificationSettings />
        </ProtectedRoute>
      } />
      <Route path="/trading" element={
        <ProtectedRoute>
          <TradingDashboard />
        </ProtectedRoute>
      } />
      <Route path="/strategies" element={
        <ProtectedRoute>
          <TradingDashboard />
        </ProtectedRoute>
      } />
      <Route path="/wallets" element={
        <ProtectedRoute>
          <TradingDashboard />
        </ProtectedRoute>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading delay to ensure all resources are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MagicAuthProvider>
          <NotificationProvider>
            <OldNotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </TooltipProvider>
            </OldNotificationProvider>
          </NotificationProvider>
        </MagicAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
