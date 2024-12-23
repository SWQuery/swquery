"use client";

import { Card } from "@/components/Atoms/card";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Transaction {
  amount: string;
  recipient: string;
  date: string;
  url_icon?: string;
  coin_name?: string;
  direction: string;
}

const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
    skewY: 5,
    rotateX: 15,
    filter: "blur(4px)",
    boxShadow: "0 0 0px rgba(0,0,0,0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    skewY: 0,
    rotateX: 0,
    filter: "blur(0px)",
    boxShadow: "0 0 20px rgba(156,136,255,0.3)",
    transition: {
      duration: 0.6,
      ease: [0.15, 0.85, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    rotateX: -10,
    filter: "blur(2px)",
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

const scanLineVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: "100%",
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      repeat: 1,
      repeatType: "reverse" as const,
    },
  },
};

export function TransactionPreview({ transactions }: { transactions: Transaction[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="visible"
      animate="visible"
      className="space-y-2 relative bg-transparent"
    >
      <AnimatePresence>
        {transactions.map((tx, index) => (
          <motion.div
            key={index}
            className="relative group"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-4 bg-transparent border border-[#9C88FF30] rounded-md transition-colors hover:bg-[#1A1A1A]/30 relative overflow-hidden">
              {/* Scan line dentro do Card */}
              <motion.div
                className="absolute top-0 left-0 h-full w-full pointer-events-none"
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={scanLineVariants}
                  className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#9C88FF]/20 to-transparent"
                />
              </motion.div>

              {/* Neon hover outline */}
              <div className="pointer-events-none absolute inset-0 rounded group-hover:shadow-[0_0_15px_#9C88FFcc] transition-shadow duration-300"></div>

              <div className="flex items-center gap-3 relative z-10">
                {
                  // Icon
                  <Image
                    src={
                      tx.url_icon ||
                      "https://cdn.helius-rpc.com/cdn-cgi/image//https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                    }
                    alt="Icon"
                    width={32}
                    height={32}
                    className="rounded-lg bg-purple-600/20"
                  />
                }
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-200">
                      {tx.direction == "in" ? "Received" : "Sent"} {tx.amount} {tx.coin_name ? tx.coin_name : "SOL"}{" "}
                      {tx.direction == "in" ? "From" : "To"} {tx.recipient}
                    </p>
                    <span className="text-xs text-gray-400">{tx.date}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
