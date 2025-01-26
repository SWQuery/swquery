import { useState } from "react";
import { motion } from "framer-motion";
import TokenCard from "@/components/Atoms/TokenCard";
import AvaiableSoon from "@/components/Atoms/AvaiableSoon";

const mockTokens = [
  { name: "Solana", mint: "SOL_MINT" },
  { name: "Ethereum", mint: "ETH_MINT" },
];

export default function TokenTab() {
  const [tokens] = useState(mockTokens);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 gap-6"
    >
      {/* {tokens.map((token, index) => (
        <TokenCard key={index} token={token} />
      ))} */}
      <AvaiableSoon/>
    </motion.div>
  );
}