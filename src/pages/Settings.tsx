import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useNotifications } from "@/components/NotificationSystem";

interface RiskConfig {
  maxConcentration: number;
  maxSectorExposure: number;
  maxSlippage: number;
  maxSpread: number;
  minLiquidity: number;
  minEdge: number;
  minConfidence: number;
  maxPositionSize: number;
  kellyFraction: number;
  positionSizingMode: 'kelly' | 'fixed' | 'risk-parity';
}

const defaultRiskConfig: RiskConfig = {
  maxConcentration: 10,
  maxSectorExposure: 30,
  maxSlippage: 5,
  maxSpread: 2,
  minLiquidity: 10000,
  minEdge: 5,
  minConfidence: 60,
  maxPositionSize: 5000,
  kellyFraction: 0.25,
  positionSizingMode: 'kelly'
};

const Settings = () => {
  const [config, setConfig] = useState<RiskConfig>(defaultRiskConfig);
  const [saved, setSaved] = useState(false);
  const { alertConfig, updateAlertConfig: updateNotificationAlertConfig } = useNotifications();

  useEffect(() => {
    const savedConfig = localStorage.getItem('zigma-risk-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('zigma-risk-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig(defaultRiskConfig);
    localStorage.removeItem('zigma-risk-config');
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">SETTINGS</h1>
              <p className="text-muted-foreground">Configure your trading parameters</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-gray-700 text-gray-200 hover:bg-gray-900"
              >
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                {saved ? '✓ Saved' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            Risk Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Concentration</CardTitle>
                <CardDescription>Max % of portfolio per position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxConcentration}
                    onChange={(e) => setConfig({ ...config, maxConcentration: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="1"
                    max="100"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Prevents overexposure to single market
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Sector Exposure</CardTitle>
                <CardDescription>Max % of portfolio per sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxSectorExposure}
                    onChange={(e) => setConfig({ ...config, maxSectorExposure: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="1"
                    max="100"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Limits exposure to correlated markets
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Slippage</CardTitle>
                <CardDescription>Max acceptable slippage %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxSlippage}
                    onChange={(e) => setConfig({ ...config, maxSlippage: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="0.1"
                    max="50"
                    step="0.1"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Rejects trades with high price impact
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Spread</CardTitle>
                <CardDescription>Max bid-ask spread %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxSpread}
                    onChange={(e) => setConfig({ ...config, maxSpread: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="0.1"
                    max="20"
                    step="0.1"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Avoids illiquid markets
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Position Size</CardTitle>
                <CardDescription>Maximum position in USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">$</span>
                  <Input
                    type="number"
                    value={config.maxPositionSize}
                    onChange={(e) => setConfig({ ...config, maxPositionSize: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="100"
                    max="100000"
                    step="100"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Hard cap on position size
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Signal Filters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Signal Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Min Liquidity</CardTitle>
                <CardDescription>Minimum market liquidity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">$</span>
                  <Input
                    type="number"
                    value={config.minLiquidity}
                    onChange={(e) => setConfig({ ...config, minLiquidity: Number(e.target.value) })}
                    className="bg-black/50 border-yellow-500/30"
                    min="1000"
                    max="1000000"
                    step="1000"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only signals with sufficient liquidity
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Min Edge</CardTitle>
                <CardDescription>Minimum effective edge %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.minEdge}
                    onChange={(e) => setConfig({ ...config, minEdge: Number(e.target.value) })}
                    className="bg-black/50 border-yellow-500/30"
                    min="0"
                    max="50"
                    step="0.5"
                  />
                  <span className="text-yellow-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Filters low-edge signals
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Min Confidence</CardTitle>
                <CardDescription>Minimum model confidence %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.minConfidence}
                    onChange={(e) => setConfig({ ...config, minConfidence: Number(e.target.value) })}
                    className="bg-black/50 border-yellow-500/30"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="text-yellow-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only high-confidence signals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            Alert Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400">Min Edge for Alert</CardTitle>
                <CardDescription>Minimum edge to trigger notification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={alertConfig.minEdgeForAlert}
                    onChange={(e) => updateNotificationAlertConfig({ minEdgeForAlert: Number(e.target.value) })}
                    className="bg-black/50 border-purple-500/30"
                    min="0"
                    max="50"
                    step="0.5"
                  />
                  <span className="text-purple-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only notify when edge exceeds threshold
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400">Min Confidence for Alert</CardTitle>
                <CardDescription>Minimum confidence to trigger notification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={alertConfig.minConfidenceForAlert}
                    onChange={(e) => updateNotificationAlertConfig({ minConfidenceForAlert: Number(e.target.value) })}
                    className="bg-black/50 border-purple-500/30"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="text-purple-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only notify when confidence exceeds threshold
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400">Alert Types</CardTitle>
                <CardDescription>Toggle notification types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableEdgeAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableEdgeAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">Edge Changes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableNewSignalAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableNewSignalAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">New Signals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableResolvedAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableResolvedAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">Resolved Signals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableSystemAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableSystemAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">System Alerts</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Position Sizing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Position Sizing
          </h2>
          
          <Card className="border-blue-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm text-blue-400">Position Sizing Mode</CardTitle>
              <CardDescription>How positions are sized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setConfig({ ...config, positionSizingMode: 'kelly' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    config.positionSizingMode === 'kelly'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-1">Kelly Criterion</h3>
                  <p className="text-xs text-muted-foreground">
                    Optimal sizing based on edge and odds
                  </p>
                </button>

                <button
                  onClick={() => setConfig({ ...config, positionSizingMode: 'fixed' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    config.positionSizingMode === 'fixed'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-1">Fixed Size</h3>
                  <p className="text-xs text-muted-foreground">
                    Same position size for all trades
                  </p>
                </button>

                <button
                  onClick={() => setConfig({ ...config, positionSizingMode: 'risk-parity' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    config.positionSizingMode === 'risk-parity'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-1">Risk Parity</h3>
                  <p className="text-xs text-muted-foreground">
                    Equal risk allocation across positions
                  </p>
                </button>
              </div>

              {config.positionSizingMode === 'kelly' && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Label htmlFor="kellyFraction">Kelly Fraction</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="kellyFraction"
                      type="number"
                      value={config.kellyFraction}
                      onChange={(e) => setConfig({ ...config, kellyFraction: Number(e.target.value) })}
                      className="bg-black/50 border-blue-500/30"
                      min="0.01"
                      max="1"
                      step="0.01"
                    />
                    <span className="text-blue-400">
                      {config.kellyFraction === 0.25 ? 'Quarter-Kelly (conservative)' :
                       config.kellyFraction === 0.5 ? 'Half-Kelly (moderate)' :
                       config.kellyFraction === 1 ? 'Full-Kelly (aggressive)' : 'Custom'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Fraction of full Kelly to use. Lower = more conservative.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-sm text-green-400">How These Settings Work</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-green-400/80 space-y-2">
              <li>• <strong>Risk Parameters</strong> limit your exposure and prevent over-concentration</li>
              <li>• <strong>Signal Filters</strong> control which signals appear in your feed</li>
              <li>• <strong>Position Sizing</strong> determines how much to allocate per trade</li>
              <li>• Settings are saved locally and apply to backtesting and signal generation</li>
              <li>• Conservative settings reduce risk but may limit returns</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
