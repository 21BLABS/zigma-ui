import React from 'react';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Wallet, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout, isAuthenticated, walletAddress, chatStatus } = useMagicAuth();

  console.log('UserProfile render:', { isAuthenticated, user, walletAddress, chatStatus });

  if (!isAuthenticated || !user) {
    console.log('UserProfile: Not authenticated or no user');
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full border border-green-500/30 z-50"
          onClick={() => console.log('Profile button clicked!')}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-green-500/20 text-green-400 text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 border-green-500/30 bg-black border-2 shadow-2xl z-[9999]" 
        align="end" 
        sideOffset={5}
      >
        <div className="flex items-center justify-start gap-2 p-3">
          <div className="flex flex-col space-y-2 leading-none w-full">
            <p className="text-sm font-medium text-green-400">{user.name}</p>
            <p className="text-xs text-green-300">{user.email}</p>
            
            {/* Wallet Address with Copy */}
            {user.wallet_address && (
              <div className="bg-gray-800/50 rounded p-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Solana Wallet
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.wallet_address || '');
                    }}
                    className="text-xs text-green-400 hover:text-green-300 underline"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-green-200 font-mono break-all">
                  {user.wallet_address}
                </p>
              </div>
            )}

            {/* ZIGMA Balance */}
            {chatStatus ? (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                <p className="text-xs text-purple-300 font-semibold">
                  {chatStatus.balance.toLocaleString()} ZIGMA
                </p>
                <p className="text-xs text-purple-200/60">
                  {chatStatus.availableChats} chats available
                </p>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded p-2">
                <p className="text-xs text-gray-400">Loading balance...</p>
              </div>
            )}
            
            <p className="text-xs text-green-200/40">
              {user.auth_provider === 'wallet' 
                ? `${user.wallet_type?.charAt(0).toUpperCase() + user.wallet_type?.slice(1) || 'Wallet'} User`
                : 'Magic.link User'
              }
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-green-500/20" />
        <DropdownMenuItem className="text-green-400 focus:bg-green-500/10 focus:text-green-300">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-green-400 focus:bg-green-500/10 focus:text-green-300">
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-green-500/20" />
        <DropdownMenuItem 
          onClick={logout}
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
