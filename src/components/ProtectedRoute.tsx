import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import Auth from './Auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, platform, connectToPlatform } = useMagicAuth();
  const location = useLocation();
  
  // Try to connect to platform if authenticated but not connected
  useEffect(() => {
    if (isAuthenticated && user && !platform.isConnected && !platform.isLoading) {
      console.log('🔄 ProtectedRoute: Attempting platform connection');
      connectToPlatform();
    }
  }, [isAuthenticated, user, platform.isConnected, platform.isLoading, connectToPlatform]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store the intended destination for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
