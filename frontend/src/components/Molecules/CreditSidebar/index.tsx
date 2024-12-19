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
          className="fixed top-0 right-0 w-80 h-full z-50 flex flex-col"
          style={{
            background: "linear-gradient(135deg, #0A0A0A 30%, #101010 100%)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 30px rgba(153,69,255,0.3)",
            borderLeft: "1px solid rgba(153,69,255,0.2)",
          }}
        >
          <div className="p-6 h-full flex flex-col relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-start mb-8 mt-2">
              <h2 
                className="text-2xl font-bold text-white mb-2 leading-tight"
                style={{
                  textShadow: "0 0 8px #6C5CE7"
                }}
              >
                Buy Credits
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Purchase additional credits with USDC. Your credits balance will update automatically.
              </p>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <label 
                htmlFor="usdcAmount" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                USDC Amount
              </label>
              <Input
                id="usdcAmount"
                type="number"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                placeholder="Enter USDC amount"
                className="w-full bg-[#1A1A1A] text-white border border-[#262626] 
                           hover:border-[#6C5CE7] focus:border-[#6C5CE7] 
                           transition-colors duration-200"
              />
            </div>

            {/* Credits Display */}
            <div className="mb-8">
              <p className="text-sm text-gray-400">
                Credits: <span className="text-white font-bold">{creditsAmount.toLocaleString()}</span>
              </p>
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Buy Button */}
            <Button
              onClick={handleBuyCredits}
              disabled={creditsAmount === 0}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] 
                         text-white font-semibold py-3 text-center
                         hover:opacity-90 
                         disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed 
                         transition-opacity duration-300 rounded-md"
            >
              <span className="relative z-10">Buy Credits</span>
              {/* Subtle glow effect behind the button text */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at center, rgba(153,69,255,0.3), transparent 70%)",
                  mixBlendMode: "screen",
                }}
              />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
