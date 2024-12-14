import { motion } from 'framer-motion';
      
export const Footer = () => {
    return (
        <footer className="container mx-auto px-6 py-8 text-center border-t border-[#14F195]">
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-gray-400"
            >
                © 2024 SWquery. Powered by Solana. All rights reserved.
            </motion.p>
        </footer>
    );
}