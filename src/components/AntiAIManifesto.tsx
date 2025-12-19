import { useState } from "react";

const AntiAIManifesto = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border border-green-400 p-4">
      <div className="text-green-400 mb-4">[ ANTI-AI MANIFESTO ]</div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-center py-2 border border-green-400 hover:bg-green-400 hover:text-black"
      >
        ▶ Expand Manifesto
      </button>
      {expanded && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-400">
          <p>ZIGMA can exist without a token. The token exists to ration access.</p>
          <p className="text-green-400 mt-2">ZIGMA TOKEN UTILITY:</p>
          <ul className="ml-4 space-y-1">
            <li>• Burn to unlock premium signal feeds</li>
            <li>• Burn for historical audit access</li>
            <li>• Burn for API rate expansion</li>
            <li>• Burn for advanced analytics</li>
          </ul>
          <p className="mt-2">No yield. No promises. Usage aligned.</p>
          <p className="mt-2 text-red-400">Error loading data: Failed to fetch</p>
          <p className="text-green-400">ZIGMA.PRO</p>
          <p>An independent market oracle.</p>
          <p className="text-yellow-400">DO NOT TRADE BASED ON HYPE.</p>
          <p className="text-yellow-400">VERIFY EVERYTHING.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="#" className="text-green-400 hover:text-white">X</a>
            <a href="#" className="text-green-400 hover:text-white">Telegram</a>
            <a href="#" className="text-green-400 hover:text-white">Docs</a>
            <a href="#" className="text-green-400 hover:text-white">Status</a>
          </div>
          <p className="text-center mt-2">https://zigma.pro/</p>
        </div>
      )}
    </section>
  );
};

export default AntiAIManifesto;
