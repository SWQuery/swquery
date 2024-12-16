"use client";
import React, { useEffect, useState, ChangeEvent, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/Molecules/Navbar";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_TRANSACTIONS = [
	{
		date: "Dec 15, 2024",
		to: "2nu...UQc4",
		source: "Lg1 - BonkRewards",
		tokenProperty: {
			name: "Solana",
			amount: "0.0005",
			symbol: "SOL",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
			},
		},
	},
	{
		date: "Jan 10, 2024",
		to: "3ab...XYZ1",
		source: "Lg2 - BonkAirdrop",
		tokenProperty: {
			name: "Bonk",
			amount: "500",
			symbol: "BONK",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/28579/large/Bonk_Logo_200.png",
			},
		},
	},
	{
		date: "Feb 20, 2024",
		to: "4cd...ABC2",
		source: "Lg3 - SamoRewards",
		tokenProperty: {
			name: "Samoyedcoin",
			amount: "250",
			symbol: "SAMO",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/11819/large/samoyedcoin.jpg",
			},
		},
	},
	{
		date: "Mar 15, 2024",
		to: "5ef...DEF3",
		source: "Lg4 - OrcaBonus",
		tokenProperty: {
			name: "Orca",
			amount: "10",
			symbol: "ORCA",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/17751/large/Orca-icon.png",
			},
		},
	},
	{
		date: "Apr 25, 2024",
		to: "6gh...GHI4",
		source: "Lg5 - RayAirdrop",
		tokenProperty: {
			name: "Raydium",
			amount: "15",
			symbol: "RAY",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/13989/large/ray_logo.png",
			},
		},
	},
	{
		date: "May 30, 2024",
		to: "7ij...JKL5",
		source: "Lg6 - MangoYield",
		tokenProperty: {
			name: "Mango",
			amount: "100",
			symbol: "MNGO",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/17162/large/mango.png",
			},
		},
	},
	{
		date: "Jun 10, 2024",
		to: "8kl...MNO7",
		source: "Lg7 - BonkBonus",
		tokenProperty: {
			name: "Bonk",
			amount: "750",
			symbol: "BONK",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/28579/large/Bonk_Logo_200.png",
			},
		},
	},
	{
		date: "Jul 20, 2024",
		to: "9mn...PQR8",
		source: "Lg8 - SamoAirdrop",
		tokenProperty: {
			name: "Samoyedcoin",
			amount: "300",
			symbol: "SAMO",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/11819/large/samoyedcoin.jpg",
			},
		},
	},
	{
		date: "Aug 15, 2024",
		to: "1op...STU9",
		source: "Lg9 - OrcaRewards",
		tokenProperty: {
			name: "Orca",
			amount: "20",
			symbol: "ORCA",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/17751/large/Orca-icon.png",
			},
		},
	},
	{
		date: "Sep 30, 2024",
		to: "2qr...VWX0",
		source: "Lg10 - RayReferral",
		tokenProperty: {
			name: "Raydium",
			amount: "25",
			symbol: "RAY",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/13989/large/ray_logo.png",
			},
		},
	},
	{
		date: "Oct 20, 2024",
		to: "3st...YZA1",
		source: "Lg11 - MangoBonus",
		tokenProperty: {
			name: "Mango",
			amount: "150",
			symbol: "MNGO",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/17162/large/mango.png",
			},
		},
	},
	{
		date: "Nov 10, 2024",
		to: "4uv...BCD2",
		source: "Lg12 - SolYield",
		tokenProperty: {
			name: "Solana",
			amount: "0.001",
			symbol: "SOL",
			metadata: {
				image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
			},
		},
	},
];

type Transaction = {
	date: string;
	to: string;
	source: string;
	tokenProperty: {
		name: string;
		amount: string;
		symbol: string;
		metadata?: {
			image?: string;
		};
	};
};

export const History = () => {
	return (
		<SolanaWalletProvider>
			<Content />
		</SolanaWalletProvider>
	);
};

const Content: React.FC = () => {
	const { connected, publicKey } = useWallet();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [filteredTransactions, setFilteredTransactions] = useState<
		Transaction[]
	>([]);
	const [query, setQuery] = useState<string>("");
	const [debouncedQuery, setDebouncedQuery] = useState(query);

	// Debounce effect
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 300);
		return () => clearTimeout(timer);
	}, [query]);

	// Memoized search handler
	const handleSearch = useCallback(() => {
		if (!debouncedQuery.trim()) {
			setFilteredTransactions(transactions);
			return;
		}

		const q = debouncedQuery.toLowerCase();
		const result = transactions.filter(
			(tx) =>
				tx.source.toLowerCase().includes(q) ||
				tx.to.toLowerCase().includes(q) ||
				tx.date.toLowerCase().includes(q) ||
				tx.tokenProperty.amount.toLowerCase().includes(q) ||
				tx.tokenProperty.name.toLowerCase().includes(q) ||
				tx.tokenProperty.symbol.toLowerCase().includes(q)
		);
		setFilteredTransactions(result);
	}, [debouncedQuery, transactions]);

	// Search effect
	useEffect(() => {
		handleSearch();
	}, [handleSearch]);

	// Connection effect
	useEffect(() => {
		if (connected && publicKey) {
			setTransactions(MOCK_TRANSACTIONS);
			setFilteredTransactions(MOCK_TRANSACTIONS);
		} else {
			setTransactions([]);
			setFilteredTransactions([]);
			setQuery("");
		}
	}, [connected, publicKey]);

	const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	// Container and card variants
	const containerVariants = {
		visible: {
			transition: { staggerChildren: 0.07 },
		},
	};

	const cardVariants = {
		hidden: {
			opacity: 0,
			y: 40,
			scale: 0.9,
			skewY: 5,
			rotateX: 15,
			filter: "blur(4px)",
			boxShadow: "0 0 0px rgba(0,0,0,0)",
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			skewY: 0,
			rotateX: 0,
			filter: "blur(0px)",
			boxShadow: "0 0 20px rgba(156,136,255,0.3)", // Roxo claro
			transition: {
				duration: 0.6,
				ease: [0.15, 0.85, 0.25, 1],
			},
		},
		exit: {
			opacity: 0,
			y: -20,
			scale: 0.95,
			rotateX: -10,
			filter: "blur(2px)",
			transition: { duration: 0.4, ease: "easeInOut" },
		},
	};

	const scanLineVariants = {
		hidden: { x: "-100%" },
		visible: {
			x: "100%",
			transition: {
				duration: 0.8,
				ease: "easeInOut",
				repeat: 1,
				repeatType: "reverse" as const,
			},
		},
	};

	return (
		<div className="relative z-10 container mx-auto px-4 py-16">
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-6 text-[#9C88FF]">
					Wallet Query
				</h1>

				{!connected ? (
					<div className="flex flex-col items-start space-y-4">
						<p className="text-gray-300">
							Conecte sua wallet para visualizar suas transações:
						</p>
						<p className="text-gray-500 text-sm">
							Use o botão &quot;Connect Wallet&quot; no topo.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						<div>
							<p className="mb-6 text-gray-200">
								Wallet conectada:{" "}
								<span className="font-semibold">
									{publicKey?.toBase58()}
								</span>
							</p>
							<div className="flex items-center space-x-2 mb-4">
								<input
									type="text"
									value={query}
									onChange={handleQueryChange}
									placeholder="Type to filter transactions..."
									className="px-4 py-2 rounded bg-[#1A1A1A] text-gray-200 border border-[#9C88FF] w-full focus:outline-none focus:ring-2 focus:ring-[#9C88FF]"
								/>
								<button
									onClick={handleSearch}
									className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] text-white px-4 py-2 rounded-full hover:opacity-90 transition-all shadow-lg font-bold"
								>
									Search
								</button>
							</div>
						</div>

						<motion.div
							variants={containerVariants}
							initial="visible"
							animate="visible"
							className="space-y-4 relative"
						>
							{filteredTransactions.length === 0 ? (
								<p className="text-gray-400">
									Nenhuma transação encontrada.
								</p>
							) : (
								<AnimatePresence>
									{filteredTransactions.map((tx, idx) => (
										<motion.div
											key={idx}
											className="bg-[#1A1A1A] p-4 rounded shadow-sm relative overflow-hidden group"
											variants={cardVariants}
											initial="hidden"
											animate="visible"
											exit="exit"
										>
											{/* Scanning line overlay */}
											<motion.div
												className="absolute top-0 left-0 h-full w-full pointer-events-none"
												initial="hidden"
												animate="visible"
											>
												<motion.div
													variants={scanLineVariants}
													className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#9C88FF]/20 to-transparent"
												/>
											</motion.div>

											{/* Neon hover outline */}
											<div className="absolute inset-0 rounded group-hover:shadow-[0_0_15px_#9C88FFcc] transition-shadow duration-300 pointer-events-none"></div>

											<div className="flex items-center space-x-3 relative z-10">
												{tx.tokenProperty.metadata
													?.image && (
													<Image
														src={
															tx.tokenProperty
																.metadata.image
														}
														alt="Transaction"
														width={48}
														height={48}
														className="rounded"
													/>
												)}
												<div>
													<p className="text-sm text-[#9C88FF] mb-1">
														{tx.source}
													</p>
													<p className="text-base text-gray-200">
														<span className="font-medium">
															Sent{" "}
															{
																tx.tokenProperty
																	.amount
															}{" "}
															{
																tx.tokenProperty
																	.symbol
															}{" "}
															(
															{
																tx.tokenProperty
																	.name
															}
															)
														</span>{" "}
														To {tx.to}
													</p>
													<p className="text-xs text-gray-400 mt-1">
														{tx.date}
													</p>
												</div>
											</div>
										</motion.div>
									))}
								</AnimatePresence>
							)}
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
};
