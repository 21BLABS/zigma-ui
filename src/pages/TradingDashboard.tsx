import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { 
  getTradingStatus,
  setupTradingWallet,
  setAutoTrade,
  autoExecuteTrades,
  fundTradingBalance,
  recordDeposit,
  requestWithdrawal,
  TradingStatus,
  Trade,
} from '@/lib/platformApi';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const TradingDashboard = () => {
  const { user, platform } = useMagicAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<TradingStatus | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [maxTradeSize, setMaxTradeSize] = useState('5');

  useEffect(() => {
    if (platform.agent) {
      fetchData();
    }
  }, [platform.agent]);

  const fetchData = async () => {
    if (!platform.agent) return;
    setIsLoading(true);
    try {
      const data = await getTradingStatus();
      if (data) {
        setStatus(data);
        setMaxTradeSize(data.autoTrade.maxTradeSize.toString());
      }
    } catch (e) {
      console.error('Failed to load trading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupWallet = async () => {
    setActionLoading(true);
    setActionMsg('');
    try {
      const result = await setupTradingWallet();
      if (result) {
        setActionMsg(result.alreadyExists
          ? 'Wallet already configured!'
          : `Wallet created: ${result.walletAddress}. Send USDC (Polygon) to start trading.`);
        await fetchData();
      } else {
        setActionMsg('Failed to create wallet');
      }
    } catch (e: any) {
      setActionMsg('Wallet setup failed: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAutoTrade = async () => {
    if (!status) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      const newEnabled = !status.autoTrade.enabled;
      const success = await setAutoTrade(newEnabled, parseFloat(maxTradeSize) || 5);
      if (success) {
        setActionMsg(newEnabled ? 'Auto-trading enabled!' : 'Auto-trading disabled');
        await fetchData();
      } else {
        setActionMsg('Failed to update auto-trade setting');
      }
    } catch (e: any) {
      setActionMsg('Error: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoExecute = async () => {
    setActionLoading(true);
    setActionMsg('');
    try {
      const result = await autoExecuteTrades();
      if (result) {
        if (result.executed > 0) {
          const tradeList = result.results
            .filter((r: any) => r.success)
            .map((r: any) => `${r.side} $${r.amount} on "${(r.market || '').slice(0, 40)}"`)
            .join(' | ');
          setActionMsg(`Executed ${result.executed}/${result.total} trades ($${result.totalSpent?.toFixed(2)} spent). ${tradeList}. Balance: $${result.remainingBalance.toFixed(2)}`);
        } else {
          const msg = result.results?.[0]?.message || (result as any).message;
          setActionMsg(`Scanned ${result.signalsScanned || 0} signals, ${result.signalsQualified || 0} qualified. ${msg || 'No trades executed.'}`);
        }
        await fetchData();
      } else {
        setActionMsg('Auto-execute returned no result');
      }
    } catch (e: any) {
      setActionMsg('Auto-execute failed: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFund = async (amount: number) => {
    setActionLoading(true);
    setActionMsg('');
    try {
      const result = await fundTradingBalance(amount);
      if (result) {
        setActionMsg(`$${result.credited} credited! New balance: $${result.newBalance.toFixed(2)}`);
        await fetchData();
      } else {
        setActionMsg('Funding failed');
      }
    } catch (e: any) {
      setActionMsg('Fund failed: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !txHash) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await recordDeposit(txHash, parseFloat(depositAmount), user?.wallet_address || '');
      setActionMsg('Deposit recorded! Balance will update shortly.');
      setDepositAmount('');
      setTxHash('');
      setShowDeposit(false);
      await fetchData();
    } catch (e: any) {
      setActionMsg('Deposit failed: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await requestWithdrawal(parseFloat(withdrawAmount), withdrawAddress);
      setActionMsg('Withdrawal requested! Processing...');
      setWithdrawAmount('');
      setWithdrawAddress('');
      setShowWithdraw(false);
      await fetchData();
    } catch (e: any) {
      setActionMsg('Withdrawal failed: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const trades = status?.trades || [];
  const activeBets = trades.filter((t: Trade) => t.status === 'PENDING' || t.status === 'EXECUTED');
  const completedBets = trades.filter((t: Trade) => t.status === 'FILLED' || (t.status as string) === 'SETTLED');
  const balance = status?.balance || { trading: 0, onChainUsdc: 0, totalDeposited: 0, totalWithdrawn: 0 };
  const stats = status?.stats || { totalPnl: 0, winRate: 0, totalTrades: 0 };
  const wallet = status?.wallet || { address: null, type: null };

  if (platform.isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <SiteHeader />
        <main className="p-6 sm:p-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mb-4"></div>
            <p className="text-green-300/60">Connecting to platform...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!platform.agent) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <SiteHeader />
        <main className="p-6 sm:p-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect to Start Trading</h2>
            <p className="text-gray-400 mb-6">Log in to let the Zigma agent trade on your behalf</p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-green-500/20 px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-green-200 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
            >
              Log In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading</h1>
              <p className="text-xs text-gray-500 mt-1">Agent auto-trades Polymarket using Zigma signals</p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs border border-green-500/30 text-green-400 px-3 py-1.5 rounded hover:bg-green-500/10 transition-all"
            >
              Refresh
            </button>
          </div>

          {/* Wallet Setup Banner */}
          {!wallet.address && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-5 text-center">
              <p className="text-sm text-yellow-300 font-semibold mb-2">No wallet configured</p>
              <p className="text-xs text-gray-400 mb-4">Create a Polygon wallet to start trading on Polymarket</p>
              <button
                onClick={handleSetupWallet}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-green-500/20 px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-green-200 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all disabled:opacity-40"
              >
                {actionLoading ? 'Creating...' : 'Create Trading Wallet'}
              </button>
            </div>
          )}

          {/* Balance + Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-green-300/60 mb-1">Balance</p>
              <p className="text-2xl font-bold text-white">${balance.trading.toFixed(2)}</p>
              <p className="text-[10px] text-green-300/40 mt-1">USDC {balance.onChainUsdc > 0 ? `(${balance.onChainUsdc.toFixed(2)} on-chain)` : ''}</p>
            </div>
            <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Total P&L</p>
              <p className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">USDC</p>
            </div>
            <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(0)}%</p>
              <p className="text-[10px] text-gray-600 mt-1">{stats.totalTrades} trades</p>
            </div>
            <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Active Bets</p>
              <p className="text-2xl font-bold text-white">{activeBets.length}</p>
              <p className="text-[10px] text-gray-600 mt-1">open positions</p>
            </div>
          </div>

          {/* Auto-Trade Toggle + Execute */}
          {wallet.address && (
            <div className="bg-black/60 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Auto-Trading</h3>
                  <p className="text-[10px] text-gray-500">Agent executes trades from Zigma signals automatically</p>
                </div>
                <button
                  onClick={handleToggleAutoTrade}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    status?.autoTrade.enabled
                      ? 'bg-green-500/20 border border-green-400/60 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                      : 'bg-gray-800 border border-gray-700 text-gray-400'
                  }`}
                >
                  {status?.autoTrade.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 mb-1 block">Max per trade (USDC)</label>
                  <Input
                    type="number"
                    value={maxTradeSize}
                    onChange={(e) => setMaxTradeSize(e.target.value)}
                    className="bg-black border-gray-800 text-white h-8 text-xs"
                  />
                </div>
                <button
                  onClick={handleAutoExecute}
                  disabled={actionLoading || !status?.autoTrade.enabled}
                  className="mt-4 px-4 py-2 rounded text-xs font-semibold bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {actionLoading ? 'Running...' : 'Run Now'}
                </button>
              </div>
            </div>
          )}

          {/* Fund / Deposit / Withdraw Buttons */}
          {wallet.address && (
            <div className="space-y-3">
              {/* Quick Fund (for testing) */}
              <div className="flex gap-2">
                {[10, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleFund(amt)}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-300 font-semibold text-xs hover:bg-green-500/20 transition-all disabled:opacity-40"
                  >
                    + Fund ${amt}
                  </button>
                ))}
              </div>
              {/* Deposit / Withdraw */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeposit(!showDeposit); setShowWithdraw(false); }}
                  className="flex-1 py-3 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-300 font-semibold text-sm hover:bg-blue-500/20 transition-all"
                >
                  On-chain Deposit
                </button>
                <button
                  onClick={() => { setShowWithdraw(!showWithdraw); setShowDeposit(false); }}
                  className="flex-1 py-3 rounded-lg border border-gray-700 bg-black/60 text-gray-300 font-semibold text-sm hover:bg-gray-900 transition-all"
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}

          {/* Action Message */}
          {actionMsg && (
            <div className={`text-xs p-3 rounded border ${actionMsg.includes('failed') ? 'border-red-500/30 text-red-400 bg-red-900/10' : 'border-green-500/30 text-green-400 bg-green-900/10'}`}>
              {actionMsg}
            </div>
          )}

          {/* Deposit Form */}
          {showDeposit && (
            <div className="bg-black/80 border border-green-500/30 rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Deposit USDC</h3>
              <p className="text-xs text-gray-400">
                Send USDC to the platform wallet, then paste the transaction hash below.
              </p>
              <div className="bg-black/60 border border-gray-800 rounded p-3">
                <p className="text-[10px] text-gray-500 mb-1">Platform Deposit Address (Polygon USDC)</p>
                <p className="text-xs text-green-400 font-mono break-all select-all">
                  {wallet.address || 'Create wallet first'}
                </p>
              </div>
              <div className="grid gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Amount (USDC)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-black border-gray-800 text-white h-10"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Transaction Hash</label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="bg-black border-gray-800 text-white h-10 font-mono text-xs"
                  />
                </div>
              </div>
              <button
                onClick={handleDeposit}
                disabled={actionLoading || !depositAmount || !txHash}
                className="w-full py-2.5 rounded bg-green-600 hover:bg-green-500 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {actionLoading ? 'Processing...' : 'Confirm Deposit'}
              </button>
            </div>
          )}

          {/* Withdraw Form */}
          {showWithdraw && (
            <div className="bg-black/80 border border-gray-700 rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Withdraw USDC</h3>
              <p className="text-xs text-gray-400">
                Withdraw your available balance to any Polygon wallet.
              </p>
              <div className="grid gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Amount (USDC)</label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-black border-gray-800 text-white h-10"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Available: ${balance.trading.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Destination Address</label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="bg-black border-gray-800 text-white h-10 font-mono text-xs"
                  />
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={actionLoading || !withdrawAmount || !withdrawAddress}
                className="w-full py-2.5 rounded bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {actionLoading ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          )}

          {/* Active Bets */}
          <div className="bg-black/60 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Active Bets
              </h2>
              <span className="text-xs text-gray-500">{activeBets.length} open</span>
            </div>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
              </div>
            ) : activeBets.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">No active bets</p>
                <p className="text-gray-600 text-xs mt-1">The agent will place bets automatically when it finds edge</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {activeBets.map((trade) => (
                  <div key={trade.id} className="px-4 py-3 hover:bg-green-500/5 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{trade.marketQuestion}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-[10px] ${trade.side === 'BUY' ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'}`}>
                            {trade.side} {trade.side === 'BUY' ? 'YES' : 'NO'}
                          </Badge>
                          <span className="text-[10px] text-gray-500">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">${trade.cost?.toFixed(2) || '0.00'}</p>
                        <p className="text-[10px] text-gray-500">@ {((trade.price || 0) * 100).toFixed(0)}¢</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Completed Trades */}
          {completedBets.length > 0 && (
            <div className="bg-black/60 border border-gray-800 rounded-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-bold text-white">Completed Trades</h2>
                <span className="text-xs text-gray-500">{completedBets.length} settled</span>
              </div>
              <div className="divide-y divide-gray-800/50">
                {completedBets.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{trade.marketQuestion}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-[10px] bg-gray-800 text-gray-400 border-gray-700">
                            {trade.side}
                          </Badge>
                          <span className="text-[10px] text-gray-600">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(trade.pnl || 0) >= 0 ? '+' : ''}{(trade.pnl || 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-600">${trade.cost?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How It Works - Simple */}
          <div className="bg-black/40 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white mb-3">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">💰</div>
                <p className="text-xs text-white font-semibold">1. Deposit</p>
                <p className="text-[10px] text-gray-500">Send USDC to fund your agent</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🤖</div>
                <p className="text-xs text-white font-semibold">2. Agent Trades</p>
                <p className="text-[10px] text-gray-500">AI finds edge & places bets automatically</p>
              </div>
              <div>
                <div className="text-2xl mb-1">📈</div>
                <p className="text-xs text-white font-semibold">3. Collect Profits</p>
                <p className="text-[10px] text-gray-500">Withdraw anytime to your wallet</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-red-400/60">
            Trading involves risk. Past performance does not guarantee future results. Not financial advice.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TradingDashboard;
