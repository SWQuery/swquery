import { useState } from "react";
import { motion } from "framer-motion";
import WalletCard from "@/components/Atoms/WalletCard";
import AvaiableSoon from "@/components/Atoms/AvaiableSoon";

const mockWallets = [{ address: "Wallet_1" }, { address: "Wallet_2" }];

export default function WalletTab() {
  const [wallets] = useState(mockWallets);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 gap-6"
    >
      {/* {wallets.map((wallet, index) => (
        <WalletCard key={index} wallet={wallet} />
      ))} */}
      <AvaiableSoon/>
    </motion.div>
  );
}