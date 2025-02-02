"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Cog } from "lucide-react"

export default function Maintenance() {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: "linear-gradient(135deg, #0b0b0b, #1a1a1a, #000000)",
          backgroundSize: "400% 400%",
        }}
        transition={{ duration: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        style={{
          background: "linear-gradient(to right, transparent, #9C88FF15, transparent)",
        }}
      >
        <motion.div
          className="absolute inset-y-0 w-1 bg-[#9C88FF50]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <div className="relative z-10 flex flex-col h-screen bg-black/70 backdrop-blur-md">
        <div className="flex-1 flex items-center justify-center p-6">
          <AnimatePresence>
            <motion.div
              key="maintenance-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl w-full space-y-8 text-center"
            >
              <div className="space-y-2">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-[#9C88FF]/10 to-[#6C5CE7]/10 flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] flex items-center justify-center">
                    <Cog className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h1
                  className="text-4xl font-bold text-gray-200 relative inline-block"
                  style={{
                    background: "linear-gradient(to right, #9C88FF, #6C5CE7, #9C88FF)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shimmer 3s linear infinite",
                  }}
                >
                  Under Maintenance
                </h1>
                <p className="text-xl text-gray-400 mt-4">We are currently improving our site to serve you better.</p>
                <p className="text-md text-gray-500 mt-2">Please check back soon. We appreciate your patience!</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
      >
        {[...Array(20)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-[#9C88FF]"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />
        ))}
      </motion.div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  )
}

