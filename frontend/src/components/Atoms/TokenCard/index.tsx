import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Token {
  name?: string;
  mint: string;
}

interface LatestData {
  mint: string;
  solAmount: number;
  marketCapSol: number;
  timestamp: number;
}

interface TokenCardProps {
  token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
  const [latestData, setLatestData] = useState<LatestData | null>(null);

  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data: LatestData = JSON.parse(event.data);
        if (data.mint === token.mint) {
          setLatestData(data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message", error);
      }
    };

    window.addEventListener("message", handleWebSocketMessage);

    return () => {
      window.removeEventListener("message", handleWebSocketMessage);
    };
  }, [token]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-4">
        {token.name || "Unknown Token"}
      </h3>
      <p className="text-sm text-gray-400 mb-2">Mint: {token.mint}</p>
      {latestData && (
        <div className="space-y-2">
          <p>Price: {latestData.solAmount} SOL</p>
          <p>Market Cap: {latestData.marketCapSol} SOL</p>
          <p>
            Last Transaction: {new Date(latestData.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
