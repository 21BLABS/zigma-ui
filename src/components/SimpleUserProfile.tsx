import React, { useState } from 'react';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { LogOut, Copy, Check } from 'lucide-react';

const SimpleUserProfile = () => {
  const { user, logout, isAuthenticated, chatStatus, walletAddress } = useMagicAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  console.log('SimpleUserProfile - user:', user);
  console.log('SimpleUserProfile - walletAddress from context:', walletAddress);
  console.log('SimpleUserProfile - user.wallet_address:', user?.wallet_address);
  console.log('SimpleUserProfile - user.publicAddress:', user?.publicAddress);
  console.log('SimpleUserProfile - chatStatus:', chatStatus);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Use walletAddress from context as primary source
  const displayWallet = walletAddress || user.wallet_address || user.publicAddress;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopy = () => {
    if (displayWallet) {
      navigator.clipboard.writeText(displayWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8 w-8 rounded-full border border-green-500/30 bg-green-500/20 hover:bg-green-500/30 transition-colors flex items-center justify-center"
      >
        <span className="text-green-400 text-xs font-semibold">
          {getInitials(user.name)}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-black border-2 border-green-500/30 rounded-lg shadow-2xl z-[101] p-4">
            {/* User Info */}
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-green-400">{user.name}</p>
                <p className="text-xs text-green-300">{user.email}</p>
              </div>

              {/* Wallet Address */}
              <div className="bg-gray-900 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Solana Wallet</p>
                  {displayWallet && (
                    <button
                      onClick={handleCopy}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-green-200 font-mono break-all">
                  {displayWallet || 'Loading wallet...'}
                </p>
              </div>

              {/* ZIGMA Balance */}
              {chatStatus ? (
                <div className="bg-purple-900/30 border border-purple-500/30 rounded p-3">
                  <div>
                    <p className="text-sm font-semibold text-purple-300">
                      {chatStatus.balance.toLocaleString()} ZIGMA
                    </p>
                    <p className="text-xs text-purple-200/70">
                      {chatStatus.availableChats} chats available
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-xs text-gray-400">Loading balance...</p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded px-4 py-2 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleUserProfile;
