import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Wallet {
  address: string;
}

interface LatestData {
  traderPublicKey: string;
  txType: string;
  solAmount: number;
  timestamp: number;
}

interface WalletCardProps {
  wallet: Wallet;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const [latestData, setLatestData] = useState<LatestData | null>(null);

  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data: LatestData = JSON.parse(event.data);
        if (data.traderPublicKey === wallet.address) {
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
  }, [wallet]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-4">Wallet</h3>
      <p className="text-sm text-gray-400 mb-2">Address: {wallet.address}</p>
      {latestData && (
        <div className="space-y-2">
          <p>Last Transaction Type: {latestData.txType}</p>
          <p>Amount: {latestData.solAmount} SOL</p>
          <p>Timestamp: {new Date(latestData.timestamp).toLocaleString()}</p>
        </div>
      )}
    </motion.div>
  );
}