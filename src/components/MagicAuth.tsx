import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Wallet, CheckCircle } from 'lucide-react';

const MagicAuth = () => {
  const { login, isAuthenticated, isLoading: authLoading, chatStatus, walletAddress } = useMagicAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setSuccess('Sending magic link to your email...');
      await login(email);
      setSuccess('Check your email for the magic link! Click it to complete login.');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logonobg.jpeg" alt="ZIGMA" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to ZIGMA</h1>
          <p className="text-green-300">Passwordless login with Magic Link</p>
        </div>

        <Card className="border-green-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-green-300">
              Enter your email to receive a magic link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/60 border-green-500/30 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <AlertDescription className="text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-green-500/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-green-400">How it works</span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-green-300/80">
                <div className="flex items-start gap-2">
                  <Wallet className="h-4 w-4 mt-0.5 text-green-400" />
                  <p>Get a Solana wallet automatically on login</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-green-400" />
                  <p>No passwords needed - just click the magic link in your email</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-400" />
                  <p>Works on mobile and desktop seamlessly</p>
                </div>
              </div>

              {walletAddress && chatStatus && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-xs text-green-400 mb-2">Your Wallet</p>
                  <p className="text-xs text-white font-mono break-all mb-3">{walletAddress}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-green-300">
                      ZIGMA Balance: <span className="text-white font-bold">{chatStatus.balance.toFixed(2)}</span>
                    </p>
                    <p className="text-green-300">
                      Available Chats: <span className="text-white font-bold">{chatStatus.availableChats}</span>
                    </p>
                    {!chatStatus.canChat && (
                      <p className="text-yellow-400 mt-2">
                        Need {chatStatus.requiredZigma} ZIGMA for 5 chats
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-green-300/60 mt-4">
          Powered by Magic.link • Secure & Passwordless
        </p>
      </div>
    </div>
  );
};

export default MagicAuth;
