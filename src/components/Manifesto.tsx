import { useState } from "react";

const Manifesto = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border border-green-400 p-4">
      <div className="text-center mb-4">
        <p className="text-green-400">[ ZIGMA CORE LOGIC ]</p>
      </div>
      <ul className="space-y-2 mb-4">
        <li>• Outputs delta only</li>
        <li>• Defaults to NO_TRADE</li>
        <li>• Consumes evidence, not opinions</li>
      </ul>
      <div className="mb-4">
        <p className="text-green-400">▶ Deterministic Logic (Advanced)</p>
        <p>MOST MARKETS DO NOT DESERVE A TRADE.</p>
        <p>A signal must pass ALL gates:</p>
        <p className="text-yellow-400">ZIGMA SPEAKS ONLY WHEN:</p>
        <ul className="ml-4 space-y-1">
          <li>- Edge survives uncertainty</li>
          <li>- Liquidity is real</li>
          <li>- Time decay is acceptable</li>
          <li>- Entropy is discounted</li>
        </ul>
        <p className="text-red-400 mt-2">NO_TRADE · EDGE INSUFFICIENT · LIQUIDITY FAIL · VOLATILITY LOCK</p>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-center py-2 border border-green-400 hover:bg-green-400 hover:text-black"
      >
        ▶ Expand Manifesto
      </button>
      {expanded && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-400">
          <p>ZIGMA can exist without a token. The token exists to ration access.</p>
          <p>ZIGMA TOKEN UTILITY:</p>
          <ul className="ml-4 space-y-1">
            <li>• Burn to unlock premium signal feeds</li>
            <li>• Burn for historical audit access</li>
            <li>• Burn for API rate expansion</li>
            <li>• Burn for advanced analytics</li>
          </ul>
          <p>No yield. No promises. Usage aligned.</p>
        </div>
      )}
    </section>
  );
};

export default Manifesto;
