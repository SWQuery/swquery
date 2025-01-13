"use client";

import { Card } from "@/components/Atoms/card";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Copy } from "lucide-react";
import { useState } from "react";

interface Transaction {
  amount: string;
  recipient: string;
  date: string;
  url_icon?: string;
  coin_name?: string;
  direction: string;
  signature?: string;
  fee?: number;
  status?: string;
  mint?: string;
  token_metadata?: Record<
    string,
    {
      links?: {
        image?: string;
      };
      files?: { cdn_uri?: string }[];
    }
  >;
}

const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const groupVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    rotateY: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    translateY: -4,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const glowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

const FALLBACK_ICON =
  "https://cdn.helius-rpc.com/cdn-cgi/image//https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

export function TransactionPreview({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  const groupedTransactions = transactions.reduce((acc, tx) => {
    const key = tx.signature || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence>
        {Object.entries(groupedTransactions).map(([signature, txs]) => (
          <motion.div
            key={signature}
            variants={groupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              {txs.length > 1 && (
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500/60 animate-pulse" />
                  <span className="text-sm font-medium text-purple-300">
                    Transaction Group ({txs.length})
                  </span>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-purple-500/20 to-transparent" />
                </div>
              )}

              <div className="space-y-3">
                {txs.map((tx, index) => {
                  const imageUrl =
                    tx.url_icon ||
                    tx.token_metadata?.[tx.mint ?? ""]?.links?.image ||
                    FALLBACK_ICON;

                  return (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      whileHover="hover"
                      className="relative"
                    >
                      <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 p-4">
                        <motion.div
                          variants={glowVariants}
                          initial="initial"
                          whileHover="hover"
                          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"
                        />
                        <div className="relative flex items-center gap-4">
                          <div className="relative">
                            <Image
                              src={imageUrl}
                              alt={tx.coin_name || "SOL"}
                              width={32}
                              height={32}
                              className="rounded-lg ring-2 ring-purple-500/20 ring-offset-2 ring-offset-black"
                            />
                            {tx.direction === "in" ? (
                              <ArrowDownRight className="absolute -bottom-1 -right-1 w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowUpRight className="absolute -bottom-1 -right-1 w-4 h-4 text-red-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="truncate">
                                <span className="text-sm font-medium text-gray-200">
                                  {tx.amount} {tx.coin_name || "SOL"}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <span>
                                    {tx.direction === "in" ? "From" : "To"}
                                  </span>
                                  <span className="truncate">
                                    {tx.recipient}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(tx.recipient)}
                                    className="ml-1 text-gray-400 hover:text-gray-200"
                                  >
                                    <Copy className="w-3 h-3 opacity-60" />
                                  </button>
                                  {copied === tx.recipient && (
                                    <span className="text-xs text-green-400 ml-1">
                                      Copied!
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-medium text-gray-300">
                                  {tx.date}
                                </div>
                                {tx.status && (
                                  <span
                                    className={`text-xs ${
                                      tx.status.toLowerCase() === "confirmed"
                                        ? "text-green-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {tx.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {tx.token_metadata?.[tx.mint ?? ""]?.links?.image && (
                              <div className="mt-1 text-xs text-gray-400 truncate">
                                {tx.token_metadata[tx.mint ?? ""]?.links?.image}
                              </div>
                            )}

                            {tx.fee !== undefined && (
                              <div className="mt-1 text-xs text-gray-500">
                                Network fee: {tx.fee} SOL
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}