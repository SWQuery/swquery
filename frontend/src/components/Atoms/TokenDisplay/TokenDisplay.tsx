import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenDisplayProps {
  balance: number;
}

export const TokenDisplay = ({ balance }: TokenDisplayProps) => {
  const formattedBalance = Number.isFinite(balance) ? balance.toLocaleString() : '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative inline-block"
    >
      <div 
        className="group relative inline-flex items-center justify-center 
                   px-4 py-2 rounded-lg border border-white/10 
                   bg-gradient-to-r from-[#9C88FF]/10 to-[#6C5CE7]/10
                   text-white font-semibold min-w-[120px]
                   shadow-sm hover:shadow-[0_0_10px_#6C5CE7AA]
                   transition-all duration-300 hover:scale-105 
                   cursor-pointer select-none"
      >
        <Coins className="mr-2 h-4 w-4 text-white" />
        <span className="relative z-10">{formattedBalance} SWQ</span>
        
        {/* Hover glow layer */}
        <span 
          className="absolute inset-0 rounded-lg
                     bg-gradient-to-r from-[#9C88FF]/40 to-[#6C5CE7]/40 
                     opacity-0 group-hover:opacity-100 
                     blur-sm pointer-events-none 
                     transition-opacity duration-300"
        ></span>
      </div>
    </motion.div>
  );
};
