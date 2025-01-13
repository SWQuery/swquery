"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Book, Wallet, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import HorizontalLogo from "../../../assets/images/logo-horizontal.png";
import { CreditsSidebar } from "@/components/Molecules/CreditSidebar";
import { useTokenAccess } from "@/app/chatbot/page";
import ChatModal from "@/components/Atoms/ChatModal";
import { Button } from "@/components/Atoms/Buttons/button";

const SWQUERY_MINT_ADDRESS = "EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump";
const RPC_URL =
	"https://mainnet.helius-rpc.com/?api-key=1d75bc40-7ebe-49bf-9cdd-6ecf3a209a11";

export const Navbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isCreditsSidebarOpen, setIsCreditsSidebarOpen] = useState(false);
	const [, setShowAccessModal] = useState(false);
	const [swqueryBalance, setSwqueryBalance] = useState<number | null>(null);

	const { connected, publicKey } = useWallet();
	const pathname = usePathname();

	const { hasAccess, isLoading: isTokenLoading } = useTokenAccess(
		SWQUERY_MINT_ADDRESS,
		RPC_URL
	);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (!isTokenLoading && hasAccess && pathname !== "/chatbot") {
			setShowAccessModal(true);
		}
	}, [hasAccess, isTokenLoading, pathname]);

	useEffect(() => {
		const fetchBalance = async () => {
			if (!connected || !publicKey) {
				setSwqueryBalance(null);
				return;
			}

			try {
				const connection = new Connection(RPC_URL, "confirmed");
				const mintPublicKey = new PublicKey(SWQUERY_MINT_ADDRESS);
				const associatedTokenAddress = await getAssociatedTokenAddress(
					mintPublicKey,
					publicKey
				);
				const accountInfo = await getAccount(
					connection,
					associatedTokenAddress
				);
				setSwqueryBalance(Number(accountInfo.amount));
			} catch (error) {
				console.error("Error fetching SWQUERY balance:", error);
				setSwqueryBalance(null);
			}
		};

		fetchBalance();
	}, [connected, publicKey]);

	const buttonBaseClasses =
		"inline-flex items-center px-4 py-2 rounded-lg border border-white/10 " +
		"bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white font-bold " +
		"hover:opacity-80 transition-transform duration-300 shadow-md";
	const especialButtonClasses =
		"inline-flex items-center px-4 py-2 rounded-lg border border-white0 " +
		"bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] text-white font-bold " +
		"hover:scale-105 transition-transform duration-300 shadow-md";

	const walletButtonStyle = {
		width: "auto",
		color: "white",
		background:
			"linear-gradient(90deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))",
		padding: "0.5rem 1rem",
		borderRadius: "1rem",
		boxShadow: "0 0 15px rgba(59,130,246,0.3)",
		cursor: "pointer",
		border: "1px solid rgba(255,255,255,0.1)",
	} as const;

	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                  ${
						isScrolled
							? "bg-black bg-opacity-15 backdrop-blur-md"
							: "bg-transparent"
					}`}
			>
				<div className="container mx-auto px-6 py-4 flex items-center justify-between">
					<Link href="/">
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
							/>
						</motion.div>
					</Link>

					<div className="hidden md:flex items-center gap-4">
						<motion.a
							href="https://bretasarthur1.gitbook.io/swquery/"
							target="_blank"
							rel="noopener noreferrer"
							className={buttonBaseClasses}
						>
							<Book className="mr-2 h-4 w-4" />
							Docs
						</motion.a>
						<WalletMultiButton
							startIcon={<Wallet className="mr-2 h-5 w-5" />}
							style={walletButtonStyle}
						>
							{connected ? (
								swqueryBalance !== null ? (
									<motion.div
										className="text-base text-gray-200 rounded-lg shadow"
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6 }}
									>
										$SWQUERY{" "}
										{swqueryBalance.toLocaleString()}
									</motion.div>
								) : (
									"Connected"
								)
							) : (
								"Connect Wallet"
							)}
						</WalletMultiButton>
						{!isTokenLoading && pathname !== "/chatbot" && (
							<>
								{hasAccess && (
									// <Link
									// 	href="/chatbot"
									// 	className={especialButtonClasses}
									// >
									// 	Join Chatbot Alpha
									// </Link>
									<Button
										onClick={() => setIsModalOpen(true)}
										className={especialButtonClasses}
									>
										Join Chatbot Alpha
									</Button>
								)}
							</>
						)}
					</div>

					<div className="md:hidden">
						<button
							className="text-white p-2"
							onClick={() =>
								setIsMobileMenuOpen(!isMobileMenuOpen)
							}
						>
							{isMobileMenuOpen ? (
								<X size={28} />
							) : (
								<Menu size={28} />
							)}
						</button>
					</div>
				</div>
			</nav>

			<CreditsSidebar
				isOpen={isCreditsSidebarOpen}
				onClose={() => setIsCreditsSidebarOpen(false)}
			/>

			<ChatModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
};
