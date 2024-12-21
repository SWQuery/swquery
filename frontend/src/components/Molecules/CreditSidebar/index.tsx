import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "@/components/Atoms/input";
import { Button } from "@/components/Atoms/Buttons/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { ProgramService } from "../../../services/wallet";
import { getUserByPubkey } from "../../../services/users";
import { buyCredits } from "../../../services/credits";

interface CreditsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsSidebar: React.FC<CreditsSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [creditsAmount, setCreditsAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean>(false);

  const wallet = useWallet();
  const programService = new ProgramService(process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com");

  useEffect(() => {
      const amount = parseFloat(usdcAmount);
      if (!isNaN(amount)) {
          setCreditsAmount(amount * 100000);
      } else {
          setCreditsAmount(0);
      }
  }, [usdcAmount]);

  useEffect(() => {
      if (wallet.publicKey) {
          setRecipient(wallet.publicKey.toBase58());
          getUserByPubkey(wallet.publicKey.toBase58())
              .then(() => {
                setUserExists(true)
                console.log("User exists!", wallet);
              })
              .catch(() =>{
                setUserExists(false)
                console.log("User exists!", wallet);
              });
      }
  }, [wallet.publicKey]);

  const handleBuyCredits = async () => {
      if (!wallet.connected || !wallet.publicKey) {
          alert("Please connect your wallet!");
          return;
      }

      if (!userExists) {
          alert("User not found. Please create an account first.");
          return;
      }

      setLoading(true);

      try {
          const lamports = parseFloat(usdcAmount) * 10 ** 6; 

          const txid = await programService.buyCredits(wallet, recipient, lamports);
          console.log(`Transaction successful via Solana! TxID: ${txid}`);
          alert(`Transaction successful! TxID: ${txid}`);

          const response = await buyCredits(wallet.publicKey.toBase58(), lamports);
          console.log("Credits purchase response:", response);
          alert("Credits successfully added to your account!");

          setUsdcAmount("");
      } catch (error) {
          console.error("Transaction failed:", error);
          alert("Transaction failed: " + error);
      } finally {
          setLoading(false);
      }
  };

  const isButtonDisabled = creditsAmount === 0 || loading;

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
                                  textShadow: "0 0 8px #6C5CE7",
                              }}
                          >
                              Buy Credits
                          </h2>
                          <p className="text-sm text-gray-400 leading-relaxed">
                              Purchase additional credits with USDC. Your credits balance will update automatically.
                          </p>
                      </div>

                      {/* Input Fields */}
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
                              Credits:{" "}
                              <span className="text-white font-bold">
                                  {creditsAmount.toLocaleString()}
                              </span>
                          </p>
                      </div>

                      {/* Spacer */}
                      <div className="flex-grow" />

                      {/* Buy Button */}
                      <Button
                          onClick={handleBuyCredits}
                          disabled={isButtonDisabled}
                          className="w-full relative overflow-hidden bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] 
                       text-white font-semibold py-3 text-center
                       hover:opacity-90 
                       disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed 
                       transition-opacity duration-300 rounded-md"
                      >
                          {loading ? "Processing..." : "Buy Credits"}
                      </Button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
  );
};