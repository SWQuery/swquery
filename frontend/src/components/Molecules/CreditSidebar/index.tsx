import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from 'lucide-react';
import { Input } from "@/components/Atoms/input";
import { Button } from "@/components/Atoms/Buttons/button";

interface CreditsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsSidebar: React.FC<CreditsSidebarProps> = ({ isOpen, onClose }) => {
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [creditsAmount, setCreditsAmount] = useState<number>(0);

  useEffect(() => {
    const amount = parseFloat(usdcAmount);
    if (!isNaN(amount)) {
      setCreditsAmount(amount * 100000);
    } else {
      setCreditsAmount(0);
    }
  }, [usdcAmount]);

  const handleBuyCredits = () => {
    console.log(`Buying ${creditsAmount} credits for ${usdcAmount} USDC`);
    setUsdcAmount("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 w-80 h-full bg-[#0A0A0A] bg-opacity-95 backdrop-blur-md z-50 shadow-lg"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Buy Credits</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-grow">
              <div className="mb-4">
                <label htmlFor="usdcAmount" className="block text-sm font-medium text-gray-400 mb-2">
                  USDC Amount
                </label>
                <Input
                  id="usdcAmount"
                  type="number"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                  placeholder="Enter USDC amount"
                  className="w-full bg-[#1A1A1A] border-[#141416] text-white"
                />
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-400">
                  Credits: <span className="text-white font-bold">{creditsAmount.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={handleBuyCredits}
              disabled={creditsAmount === 0}
              className="w-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:opacity-90 text-white transition-opacity"
            >
              Buy Credits
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

