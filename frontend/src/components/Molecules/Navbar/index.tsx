"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreditCard, Book, Wallet, Menu, X } from "lucide-react";
import HorizontalLogo from "../../../assets/images/logo-horizontal.png";
import { CreditsSidebar } from "@/components/Molecules/CreditSidebar";
import Link from "next/link";
import { TokenDisplay } from "@/components/Atoms/TokenDisplay/TokenDisplay";
import { createUser } from "../../../services/users";

const userBalance = 12345678;

const walletButtonStyle = {
  width: "auto",
  color: "white",
  background: "linear-gradient(90deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))",
  padding: "0.5rem 1rem",
  borderRadius: "1rem",
  boxShadow: "0 0 15px rgba(59,130,246,0.3)",
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.1)",
  outline: "none",
  fontSize: "1rem",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

// Mobile specific styles
const mobileWalletButtonStyle = {
  ...walletButtonStyle,
  width: "100%",
} as const;

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreditsSidebarOpen, setIsCreditsSidebarOpen] = useState(false);

  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      const pubkeyString = publicKey.toBase58();
      createUser(pubkeyString).catch((error) => {
        console.error("Error creating user:", error);
      });
    }
  }, [connected, publicKey]);

  const buttonBaseClasses =
    "inline-flex items-center px-4 py-2 rounded-lg border border-white/10 " +
    "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white font-bold " +
    "hover:opacity-80 transition-transform duration-300 shadow-md";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                  overflow-x-visible
                  ${isScrolled ? "bg-black bg-opacity-15 backdrop-blur-md" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={"/"}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src={HorizontalLogo}
              alt="Logo"
              width={150}
              unoptimized
              className="cursor-pointer"
            />
          </motion.div>
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <motion.a
            href="https://bretasarthur1.gitbook.io/swquery/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={buttonBaseClasses}
            onMouseEnter={(e) => e.currentTarget.classList.add("scale-105", "shadow-lg")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("scale-105", "shadow-lg")}
          >
            <Book className="mr-2 h-4 w-4" />
            Docs
          </motion.a>

          {/* <motion.button
            type="button"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={buttonBaseClasses}
            onClick={() => setIsCreditsSidebarOpen(true)}
            onMouseEnter={(e) => e.currentTarget.classList.add("scale-105", "shadow-lg")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("scale-105", "shadow-lg")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Buy Credits
          </motion.button> */}

          {/* {connected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <TokenDisplay balance={userBalance} />
            </motion.div>
          )} */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget.querySelector(".wallet-adapter-button");
              btn?.classList.add("shadow-lg", "scale-105");
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget.querySelector(".wallet-adapter-button");
              btn?.classList.remove("shadow-lg", "scale-105");
            }}
          >
            <WalletMultiButton
              startIcon={<Wallet className="mr-2 h-5 w-5" />}
              style={walletButtonStyle}
            >
              {connected ? "Connected" : "Connect Wallet"}
            </WalletMultiButton>
          </motion.div>
        </div>

        {/* Hamburger Menu */}
        <div className="md:hidden">
          <button 
            className="text-white p-2" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col gap-4 bg-[#0A0A0A] bg-opacity-80 
                       backdrop-blur-md border-t border-white/10
                       px-6 py-4"
          >
            <motion.a
              href="https://bretasarthur1.gitbook.io/swquery/"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonBaseClasses + " w-full justify-center"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Book className="mr-2 h-4 w-4" />
              Docs
            </motion.a>

            <motion.button
              type="button"
              className={buttonBaseClasses + " w-full justify-center"}
              onClick={() => {
                setIsCreditsSidebarOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Buy Credits
            </motion.button>

            {connected && (
              <motion.div className="w-full">
                <TokenDisplay balance={userBalance} />
              </motion.div>
            )}

            <motion.div className="w-full flex justify-center md:block">
              <WalletMultiButton
                startIcon={<Wallet className="mr-2 h-5 w-5" />}
                style={mobileWalletButtonStyle}
              >
                {connected ? "Connected" : "Connect Wallet"}
              </WalletMultiButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits Sidebar */}
      <CreditsSidebar
        isOpen={isCreditsSidebarOpen}
        onClose={() => setIsCreditsSidebarOpen(false)}
      />
    </nav>
  );
};