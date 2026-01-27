import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, Mail, User, ExternalLink } from 'lucide-react';
import '@/debug-auth';

const Auth = () => {
  const { login, signup, loginWithWallet, resetPassword, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to home page if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      // Redirect will be handled by useEffect
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await signup(email, password, name);
      setSuccess('Signup successful! Redirecting...');
      // Redirect will be handled by useEffect
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  const handleWalletLogin = async (walletType: 'backpack') => {
    setError('');
    setSuccess('');
    
    try {
      await loginWithWallet(walletType);
      setSuccess(`${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet connected successfully! Redirecting...`);
      // Redirect will be handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Wallet connection failed.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logonobg.jpeg" alt="ZIGMA" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to ZIGMA</h1>
          <p className="text-green-300">Connect to access prediction market intelligence</p>
        </div>

        <Card className="border-green-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-green-400">Authentication</CardTitle>
            <CardDescription className="text-center text-green-300">
              Choose your preferred login method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-green-900/20">
                <TabsTrigger value="email" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="wallet" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  <Wallet className="w-4 h-4 mr-2" />
                  Wallet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-green-900/20">
                    <TabsTrigger value="login" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4 mt-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-green-300">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-black/50 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-green-300">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-black/50 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-green-500 hover:bg-green-600 text-black"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => {
                          const resetEmail = prompt('Enter your email address for password reset:');
                          if (resetEmail) {
                            setEmail(resetEmail);
                            handlePasswordReset(new Event('submit') as any);
                          }
                        }}
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-green-300">Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-black/50 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-green-300">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-black/50 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-green-300">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-black/50 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-green-500 hover:bg-green-600 text-black"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Sign Up'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4">
                <div className="space-y-4">
                  {/* Solana Wallets */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-300 mb-3">Connect Your Wallet</p>
                    </div>
                    
                    {/* Backpack */}
                    <Button 
                      onClick={() => handleWalletLogin('backpack')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 mr-2 bg-blue-500 rounded flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                          </div>
                          Backpack
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Wallet Installation Links */}
                  <div className="text-center space-y-2">
                    <p className="text-xs text-green-200/60">Don't have a wallet?</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <a 
                        href="https://backpack.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Backpack
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 border-red-500/30 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-500/30 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-green-200/60">
          <p>By connecting, you agree to ZIGMA's Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
