import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { NotificationProvider } from "@/components/NotificationSystem";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FallbackAuthProvider } from "@/contexts/FallbackAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./components/Auth";
import Index from "./pages/Index";
import Manifesto from "./pages/Manifesto";
import Logs from "./pages/Logs";
import Docs from "./pages/Docs";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import SignalPerformance from "./pages/SignalPerformance";
import Backtesting from "./pages/Backtesting";
import Settings from "./pages/Settings";
import PaperTrading from "./pages/PaperTrading";
import TermsOfService from "./pages/TermsOfService";
import UserGuide from "./pages/UserGuide";
import SDKGuide from "./pages/SDKGuide";
import ApiDocumentation from "./pages/ApiDocumentation";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import { useKeyboardShortcuts } from "./utils/keyboard-shortcuts";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  useKeyboardShortcuts({
    'Alt+h': () => navigate('/'),
    'Alt+a': () => navigate('/analytics'),
    'Alt+s': () => navigate('/signals'),
    'Alt+b': () => navigate('/backtesting'),
    'Alt+w': () => navigate('/settings'),
    'Alt+l': () => navigate('/logs'),
    'Alt+d': () => navigate('/docs'),
    'Alt+k': () => navigate('/sdk-guide'),
    'Alt+g': () => navigate('/user-guide'),
    'Alt+f': () => navigate('/faq'),
    'Alt+?': () => navigate('/api-documentation'),
    'Escape': () => navigate('/'),
    'Alt+t': () => navigate('/terms-of-service'),
    'Alt+r': () => window.location.reload(),
  });

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/manifesto" element={<Manifesto />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/user-guide" element={<UserGuide />} />
      <Route path="/sdk-guide" element={<SDKGuide />} />
      <Route path="/api-documentation" element={<ApiDocumentation />} />
      
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
      <Route path="/backtesting" element={
        <ProtectedRoute>
          <Backtesting />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/paper-trading" element={
        <ProtectedRoute>
          <PaperTrading />
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
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <FallbackAuthProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </FallbackAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
