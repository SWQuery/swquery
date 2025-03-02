"use client"

import { Card } from "@/components/Atoms/card"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface TrendingToken {
  chainId: string
  address: string
  name: string
  symbol: string
  logoUrl: string
  marketCap: number
  volume: number
  volumeChange: number
  price: number
  priceChange: number
}

const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
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
}

const glowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
  return num.toFixed(2)
}

export function TrendingTokensPreview({ tokens }: { tokens: TrendingToken[] }) {
  const [expandedTokens, setExpandedTokens] = useState<string[]>([])

  const toggleExpanded = (address: string) => {
    setExpandedTokens((prev) => (prev.includes(address) ? prev.filter((a) => a !== address) : [...prev, address]))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <span className="text-lg font-medium text-purple-300">Trending Tokens</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-purple-500/20 to-transparent" />
      </div>

      <AnimatePresence>
        {tokens.map((token) => (
          <motion.div key={token.address} variants={cardVariants} className="relative">
            <Card className="relative overflow-hidden bg-black/40 border border-[#181818] p-4">
              <motion.div
                variants={glowVariants}
                initial="initial"
                whileHover="hover"
                className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 pointer-events-none"
              />
              <div className="relative flex items-center gap-4">
                <div className="relative">
                  <img
                    src={token.logoUrl || "/placeholder.svg"}
                    alt={token.name}
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-purple-500/20 ring-offset-2 ring-offset-black"
                  />
                  {token.priceChange > 0 ? (
                    <ArrowUpRight className="absolute -bottom-1 -right-1 w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="absolute -bottom-1 -right-1 w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-200">{token.name}</span>
                      <div className="text-xs text-gray-400">{token.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-200">${token.price.toFixed(4)}</div>
                      <div className={`text-xs ${token.priceChange > 0 ? "text-green-400" : "text-red-400"}`}>
                        {token.priceChange > 0 ? "+" : ""}
                        {token.priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleExpanded(token.address)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm cursor-pointer relative z-10
                    rounded-lg border border-white/10 
    bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white font-bold
    hover:opacity-80 transition-transform duration-300 shadow-md
                "
              >
                {expandedTokens.includes(token.address) ? (
                  <>
                    Hide details
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show details
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {expandedTokens.includes(token.address) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-sm text-gray-400 space-y-2 bg-purple-500/5 p-4 rounded-md relative z-10"
                  >
                    <div>Market Cap: ${formatNumber(token.marketCap)}</div>
                    <div>Volume: ${formatNumber(token.volume)}</div>
                    <div className={`${token.volumeChange > 0 ? "text-green-400" : "text-red-400"}`}>
                      Volume Change: {token.volumeChange > 0 ? "+" : ""}
                      {token.volumeChange.toFixed(2)}%
                    </div>
                    <div className="text-gray-500">Chain: {token.chainId}</div>
                    <div className="text-gray-500 truncate">Address: {token.address}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

