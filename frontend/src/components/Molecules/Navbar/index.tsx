/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Book, Wallet, Menu, X, Cog } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import HorizontalLogo from "../../../assets/images/new-logo-horizontal.png";
import { CreditsSidebar } from "@/components/Molecules/CreditSidebar";
import ChatModal from "@/components/Atoms/ChatModal";
import { Button } from "@/components/Atoms/Buttons/button";
import { Input } from "@/components/Atoms/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCookie, setCookie } from "cookies-next/client";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import { useTokenAccess } from "@/app/hooks/useTokenAccess";

const SWQUERY_MINT_ADDRESS = "EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump";
const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=";

const validateOpenAIKey = (value: string) => {
	const pattern = /^sk-proj-/;
	return pattern.test(value);
};

const validateHeliusKey = (value: string) => {
	const pattern =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return pattern.test(value);
};

const formatHeliusKey = (value: string) => {
	const cleaned = value.replace(/[^0-9a-f]/gi, "");

	let formatted = "";
	for (let i = 0; i < cleaned.length && i < 32; i++) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			formatted += "-";
		}
		formatted += cleaned[i];
	}

	return formatted;
};

export const Navbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isCreditsSidebarOpen, setIsCreditsSidebarOpen] = useState(false);
	const [, setShowAccessModal] = useState(false);
	const [swqueryBalance, setSwqueryBalance] = useState<number | null>(null);

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [openAIKey, setOpenAIKey] = useState("");
	const [heliusKey, setHeliusKey] = useState("");
	const [isOpenAIValid, setIsOpenAIValid] = useState(true);
	const [isHeliusValid, setIsHeliusValid] = useState(true);
	const [heliusVisible, setHeliusVisible] = useState(false);
	const [openaiVisible, setOpenaiVisible] = useState(false);

	const { connected, publicKey } = useWallet();
	const pathname = usePathname();

	const rpc =
		RPC_URL +
		(getCookie("helius_key") || "c34a7f87-00f1-4691-ba9a-5daddb36588a");
	const { hasAccess, isLoading: isTokenLoading } = useTokenAccess(
		SWQUERY_MINT_ADDRESS,
		rpc
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
		const openai_key = getCookie("openai_key") as string;
		const helius_key = getCookie("helius_key") as string;
		if (openai_key && helius_key) {
			setOpenAIKey(openai_key);
			setHeliusKey(helius_key);
		}
	}, []);

	const handleOpenAIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setOpenAIKey(value);
		setIsOpenAIValid(value === "" || validateOpenAIKey(value));
	};

	const handleHeliusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formattedValue = formatHeliusKey(value);
		setHeliusKey(formattedValue);
		setIsHeliusValid(
			formattedValue === "" || validateHeliusKey(formattedValue)
		);
	};

	const changeVisibility = (key: string) => {
		if (key === "helius") {
			setHeliusVisible(!heliusVisible);
		} else {
			setOpenaiVisible(!openaiVisible);
		}
	};

	const saveSettings = () => {
		try {
			setCookie("openai_key", openAIKey, {
				maxAge: 60 * 60 * 24 * 30,
			});
			setCookie("helius_key", heliusKey, {
				maxAge: 60 * 60 * 24 * 30,
			});
			toast.success("Settings saved successfully!", {
				duration: 3000,
				style: {
					background: "#18181B",
					color: "#FFFFFF",
					border: "0.5px solid #9C88FF",
				},
			});
			setIsSettingsOpen(false);
		} catch (error) {
			toast.error("Failed to save settings");
		}
	};

	const { handleSubmit } = useForm();

	const buttonBaseClasses =
		"inline-flex items-center px-4 py-2 rounded-lg border border-white/10 " +
		"bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white font-bold " +
		"hover:opacity-80 transition-transform duration-300 shadow-md";

	// const especialButtonClasses =
	//     "inline-flex items-center px-4 py-2 rounded-lg border border-white0 " +
	//     "bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] text-white font-bold " +
	//     "hover:scale-105 transition-transform duration-300 shadow-md";

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

					<div className="hidden md:flex items-center gap-3">
						<Button asChild className={buttonBaseClasses}>
							<a
								href="https://bretasarthur1.gitbook.io/swquery/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Book className="mr-2 h-4 w-4" />
								Docs
							</a>
						</Button>

						<WalletMultiButton
							startIcon={<Wallet className="mr-2 h-5 w-5" />}
							style={walletButtonStyle}
						>
							{connected ? (
								swqueryBalance !== null ? (
									<motion.div
										className="text-base text-white rounded-lg shadow"
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
							<Button
								asChild
								className={buttonBaseClasses}
							>
								<Link href="/chatbot">
									Join Chatbot
								</Link>
							</Button>
						)}
					</div>

					<div className="md:hidden">
						<Button
							className={buttonBaseClasses}
							onClick={() =>
								setIsMobileMenuOpen(!isMobileMenuOpen)
							}
						>
							{isMobileMenuOpen ? (
								<X size={28} />
							) : (
								<Menu size={28} />
							)}
						</Button>
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
