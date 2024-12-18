"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreditCard, Book, Wallet } from 'lucide-react';
import HorizontalLogo from "../../../assets/images/logo-horizontal.png";
import { CreditsSidebar } from "@/components/Molecules/CreditSidebar";
import Link from "next/link";

// Add this CSS to your global styles or a CSS module
const walletButtonStyles = {
  ".wallet-adapter-button-start-icon": {
    display: "inline-flex !important"
  },
  ".wallet-adapter-button-end-icon": {
    display: "none !important"
  },
  // Hide the wallet icon that appears next to wallet names
  ".wallet-adapter-modal-list-more": {
    "& .wallet-adapter-modal-list-more-icon-container": {
      display: "none !important"
    }
  }
} as const;

export const Navbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isCreditsSidebarOpen, setIsCreditsSidebarOpen] = useState(false);
	const { connected } = useWallet();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? "bg-black bg-opacity-15 backdrop-blur-md"
					: "bg-transparent"
			}`}
		>
			<div className="container mx-auto px-6 py-4 flex justify-between items-center h-full">
				<Link href={"/"}>
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
				</Link>

				<div className="space-x-4 flex items-center">
					{/* Docs Button */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="relative"
						onMouseEnter={(e) => {
							const button = e.currentTarget.querySelector("a");
							if (button) {
								button.classList.add("shadow-lg", "scale-105");
							}
						}}
						onMouseLeave={(e) => {
							const button = e.currentTarget.querySelector("a");
							if (button) {
								button.classList.remove(
									"shadow-lg",
									"scale-105"
								);
							}
						}}
					>
						<a
							href="https://bretasarthur1.gitbook.io/swquery/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center text-white hover:opacity-80 transition-all duration-300 font-bold relative group bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-lg shadow-md border border-white/10 outline-none text-center min-w-[120px]"
						>
							<Book className="mr-2 h-4 w-4" />
							<span className="relative z-10">Docs</span>
							<span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"></span>
						</a>
					</motion.div>

					{/* Buy Credits Button */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative"
						onMouseEnter={(e) => {
							const button =
								e.currentTarget.querySelector("button");
							if (button) {
								button.classList.add("shadow-lg", "scale-105");
							}
						}}
						onMouseLeave={(e) => {
							const button =
								e.currentTarget.querySelector("button");
							if (button) {
								button.classList.remove(
									"shadow-lg",
									"scale-105"
								);
							}
						}}
					>
						<button
							onClick={() => setIsCreditsSidebarOpen(true)}
							className="inline-flex items-center text-white hover:opacity-80 transition-all duration-300 font-bold relative group bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-lg shadow-md border border-white/10 outline-none text-center min-w-[120px]"
						>
							<CreditCard className="mr-2 h-4 w-4" />
							<span className="relative z-10">Buy Credits</span>
							<span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"></span>
						</button>
					</motion.div>

					{/* Wallet Button */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="relative group"
						onMouseEnter={(e) => {
							const button = e.currentTarget.querySelector(
								".wallet-adapter-button"
							);
							if (button) {
								button.classList.add("shadow-lg", "scale-105");
							}
						}}
						onMouseLeave={(e) => {
							const button = e.currentTarget.querySelector(
								".wallet-adapter-button"
							);
							if (button) {
								button.classList.remove(
									"shadow-lg",
									"scale-105"
								);
							}
						}}
					>
						<WalletMultiButton
							startIcon={
								<Wallet className="mr-2 h-5 w-5" />
							}
							style={{
								width: "auto",
								minWidth: "120px",
								color: "white",
								background:
									"linear-gradient(90deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))",
								padding: "0.5rem 1rem",
								borderRadius: "1rem",
								boxShadow: "0 0 15px rgba(59,130,246,0.3)",
								cursor: "pointer",
								border: "1px solid rgba(255,255,255,0.1)",
								outline: "none",
								fontSize: "1rem",
								fontWeight: "bold",
								transition: "all 0.3s ease",
								position: "relative",
								overflow: "hidden",
								textAlign: "center",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
                ...walletButtonStyles // Add the custom styles
							}}
						>
							{connected ? "Connected" : "Connect Wallet"}
						</WalletMultiButton>
						<span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"></span>
					</motion.div>
				</div>
			</div>
			<CreditsSidebar
				isOpen={isCreditsSidebarOpen}
				onClose={() => setIsCreditsSidebarOpen(false)}
			/>
		</nav>
	);
};

