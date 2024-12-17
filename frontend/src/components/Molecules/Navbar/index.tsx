"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CreditCard } from 'lucide-react';
import HorizontalLogo from "../../../assets/images/logo-horizontal.png";
import { CreditsSidebar } from "@/components/Molecules/CreditSidebar";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCreditsSidebarOpen, setIsCreditsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        isScrolled
          ? "bg-black bg-opacity-15 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-4"
        >
          <Image
            src={HorizontalLogo}
            alt="Logo"
            width={150}
            unoptimized
            className="cursor-pointer"
          />
        </motion.div>

        <div className="space-x-4 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
            onMouseEnter={(e) => {
              const button = e.currentTarget.querySelector('a');
              if (button) {
                button.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.4)";
                button.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              const button = e.currentTarget.querySelector('a');
              if (button) {
                button.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.3)";
                button.style.transform = "scale(1)";
              }
            }}
          >
            <a
              href="https://bretasarthur1.gitbook.io/swquery/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white hover:opacity-80 transition-all duration-300 font-bold relative group"
              style={{
                background: "linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                cursor: "pointer",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                outline: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              <span className="relative z-10">Docs</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
            onMouseEnter={(e) => {
              const button = e.currentTarget.querySelector('button');
              if (button) {
                button.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.4)";
                button.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              const button = e.currentTarget.querySelector('button');
              if (button) {
                button.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.3)";
                button.style.transform = "scale(1)";
              }
            }}
          >
            <button
              onClick={() => setIsCreditsSidebarOpen(true)}
              className="inline-flex items-center text-white hover:opacity-80 transition-all duration-300 font-bold relative group"
              style={{
                background: "linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                cursor: "pointer",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                outline: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span className="relative z-10">Buy Credits</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
            </button>
          </motion.div>

          <div
            onMouseEnter={(e) => {
              const button = e.currentTarget.querySelector('button');
              if (button) {
                button.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.4)";
                button.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              const button = e.currentTarget.querySelector('button');
              if (button) {
                button.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.3)";
                button.style.transform = "scale(1)";
              }
            }}
          >
            <WalletMultiButton
              style={{
                width: "auto",
                minWidth: "120px",
                color: "white",
                background: "linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                cursor: "pointer",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                outline: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      </div>
      <CreditsSidebar isOpen={isCreditsSidebarOpen} onClose={() => setIsCreditsSidebarOpen(false)} />
    </nav>
  );
};

