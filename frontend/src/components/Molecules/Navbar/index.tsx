"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import HorizontalLogo from "../../../assets/images/logo-horizontal.png";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link } from "lucide-react";

export const Navbar = () => {
	return (
		<nav className="container mx-auto px-6 py-4 flex justify-between items-center">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="flex items-center space-x-4"
			>
				<Image
					src={HorizontalLogo}
					alt="Logo"
					width={300}
					unoptimized
				/>
			</motion.div>
			
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="space-x-4 flex items-center"
			>
			<motion.button
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.1 }}
				className="bg-[#1A1A1A] text-gray-400 px-4 py-2 rounded-full border border-[#14F195] hover:opacity-80 transition-all"
			>
				<a href="https://bretasarthur1.gitbook.io/swquery/" target="_blank" rel="noopener noreferrer">
					Docs
				</a>
			</motion.button>
				<select className="bg-[#1A1A1A] text-gray-400 px-4 py-2 rounded-full border border-[#14F195]">
					<option>Devnet</option>
					<option>Mainnet</option>
					<option>Testnet</option>
				</select>
				
				{/* <button className="bg-gradient-to-r from-[#14F195] to-[#00D1FF] text-black px-4 py-2 rounded-full hover:opacity-80 transition-all shadow-lg">
                Connect Wallet
            </button> */}
				<WalletMultiButton
					style={{
						width: "auto",
						color: "black",
						background:
							"linear-gradient(90deg, #14F195 0%, #00D1FF 100%)",
						padding: "0.5rem 1rem",
						borderRadius: "1rem",
						boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
						cursor: "pointer",
						border: "none",
						outline: "none",
						fontSize: "1rem",
						fontWeight: "bold",
						transition: "opacity 0.3s ease",
					}}
					disabled={false}
					tabIndex={0}
				/>
			</motion.div>
		</nav>
	);
};
