"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Molecules/Navbar";

export const PitchDeck = () => {
  return (
    <>
      <Navbar />
      <div className="w-full h-[100vh] flex flex-col items-center justify-center space-y-8">
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] px-6 py-3 rounded-full hover:opacity-80 transition-all shadow-lg w-full sm:w-auto"
        >
          <Link href={"https://pdfupload.io/docs/f28c6a05"} target="_blank">
            Go to Pitch Deck PDF
          </Link>
        </motion.button>
      </div>
    </>
  );
};
