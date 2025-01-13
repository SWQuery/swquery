/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/Atoms/Buttons/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, X } from "lucide-react"; // Importação do ícone 'X'
import { TransactionPreview } from "@/components/Molecules/TransactionPrev/TransactionPreview";
import { Navbar } from "@/components/Molecules/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/services/config/api";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next/client";
import TutorialModal from "@/components/Atoms/TutorialModal";
import { useForm } from "react-hook-form";

async function interactChatbot(input_user: string, address: string) {
	try {
		const openai_key = getCookie("openai_key");
		const helius_key = getCookie("helius_key");

		if (!openai_key || !helius_key) {
			throw new Error("API keys are missing");
		}

		const response = await api.post(
			"http://0.0.0.0:5500/chatbot/interact", // Use the service name 'agent'
			{
				input_user,
				address,
				helius_key,
				openai_key,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"x-api-key": "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM", // Ensure this matches the curl command
				},
			}
		);
		return response.data;
	} catch (error: unknown) {
		console.error("Error interacting with chatbot:", error);
		throw error;
	}
}

interface Message {
	content: string;
	isUser: boolean;
}

interface Chat {
	id: number;
	name: string;
	messages: Message[];
}

export default function ChatInterface() {
	const [chats, setChats] = useState<Chat[]>([]);
	const [currentChatId, setCurrentChatId] = useState<number | null>(null);
	const [prompt, setPrompt] = useState("");
	const [fetchedTransactions, setFetchedTransactions] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showTutorial, setShowTutorial] = useState(false);

	const { connected, publicKey } = useWallet();
	const router = useRouter(); // Mova o useRouter para o início do componente

	const currentChat = chats.find((chat) => chat.id === currentChatId);

	function mapHeliusResponseToPreviewData(transactions: any[]) {
		const fullTransactions: any = [];
		transactions.map((tx: any) => {
			tx.details?.transfers?.map((transfer: any) => {
				fullTransactions.push({
					amount: transfer.amount,
					recipient: tx.signature?.slice(0, 6) + "..." || "",
					date: new Date(tx.timestamp * 1000).toLocaleString(),
					direction: transfer.direction,
					fee: tx.details?.fee,
					status: tx.status,
					mint: transfer.mint,
					url_icon:
						tx.token_metadata &&
						tx.token_metadata[transfer.mint]?.files &&
						tx.token_metadata[transfer.mint].files[0]?.cdn_uri,
					coin_name:
						tx.token_metadata &&
						tx.token_metadata[transfer.mint]?.metadata?.symbol,
				});
			});
		});
		return fullTransactions;
	}

	async function handleSend() {
		console.log("handleSend");
		if (!prompt.trim()) return;
		if (!connected || !publicKey) {
			toast.error("You need to have a connected wallet!");
			return;
		}

		setIsLoading(true);
		try {
			const json = await interactChatbot(prompt, publicKey.toString());
			const llmAnswer =
				json.report || "Here are the transactions I found:";
			const newChat: Chat = {
				id: Date.now(),
				name: prompt,
				messages: [
					{ content: prompt, isUser: true },
					{ content: llmAnswer, isUser: false },
				],
			};
			setChats((prev) => [...prev, newChat]);
			setCurrentChatId(newChat.id);
			const heliusTxs = Array.isArray(json.response) ? json.response : [];
			setFetchedTransactions(heliusTxs);
			setPrompt("");
		} catch (error) {
			console.error("Error sending prompt:", error);
			toast.error("There was an error processing your request.");
		} finally {
			setIsLoading(false);
		}
	}

	const previewData = mapHeliusResponseToPreviewData(fetchedTransactions);

	const { hasAccess, isLoading: isAccessLoading } = useTokenAccess(
		"EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump",
		"https://mainnet.helius-rpc.com/?api-key=1d75bc40-7ebe-49bf-9cdd-6ecf3a209a11"
	);

	const LoadingState = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div className="bg-gradient-to-br from-zinc-800 to-black rounded-lg shadow-lg p-8 text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
				<p className="text-gray-300">Checking token access...</p>
			</div>
		</div>
	);

	const { register, handleSubmit } = useForm();

	// Função para redirecionar para a página inicial
	const handleCloseChat = () => {
		router.push("/"); // Altere para a rota da página inicial do chatbot se for diferente
	};

	return (
		<div className="relative flex flex-col h-screen overflow-hidden">
			<motion.div
				className="absolute inset-0 z-0"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				style={{
					background:
						"linear-gradient(135deg, #0b0b0b, #1a1a1a, #000000)",
					backgroundSize: "400% 400%",
				}}
				transition={{ duration: 2 }}
			/>
			<motion.div
				className="pointer-events-none absolute inset-0 z-0"
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.1 }}
				style={{
					background:
						"linear-gradient(to right, transparent, #9C88FF15, transparent)",
				}}
			>
				<motion.div
					className="absolute inset-y-0 w-1 bg-[#9C88FF50]"
					initial={{ x: "-100%" }}
					animate={{ x: "100%" }}
					transition={{
						duration: 5,
						repeat: Infinity,
						repeatType: "reverse",
						ease: "easeInOut",
					}}
				/>
			</motion.div>
			<div className="relative z-10 flex flex-col h-screen bg-black/70 backdrop-blur-md">
				<Navbar />
				{isAccessLoading ? (
					<LoadingState />
				) : hasAccess ? (
					<div className="flex flex-1 h-[calc(100vh-5rem)] bg-black mt-20">
						{/* Mobile backdrop */}
						{isSidebarOpen && (
							<div
								className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
								onClick={() => setIsSidebarOpen(false)}
							/>
						)}

						<div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-900 to-black">
							<div className="flex-1 overflow-hidden">
								<AnimatePresence mode="wait">
									{currentChat ? (
										// Chat view content
										<motion.div
											key="chat-view" 
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.3 }}
											className="flex flex-col md:flex-row h-full relative"
										>
											{/* Chat view content... */}
											{/* Botão de fechar chat */}
											<Button
												onClick={handleCloseChat}
												className="absolute top-4 right-4 bg-transparent p-2 rounded-full hover:bg-gray-800 transition-colors z-50" // Ajustes de estilo
												aria-label="Close Chat"
											>
												<X className="w-6 h-6 text-gray-400 hover:text-white" />
											</Button>

											<div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto">
												<div className="p-6 space-y-4">
													{currentChat.messages.map(
														(message, index) => (
															<div
																key={index}
																className={cn(
																	"flex items-start gap-3",
																	message.isUser
																		? "justify-end"
																		: "justify-start"
																)}
															>
																{message.isUser ? (
																	<motion.p
																		initial={{
																			opacity: 0,
																			scale: 0.95,
																		}}
																		animate={{
																			opacity: 1,
																			scale: 1,
																		}}
																		transition={{
																			duration: 0.2,
																		}}
																		className="bg-[#1A1A1A]/50 border border-[#141416] rounded-lg p-4 text-gray-200"
																	>
																		{
																			message.content
																		}
																	</motion.p>
																) : (
																	<motion.div
																		initial={{
																			opacity: 0,
																			x: -10,
																		}}
																		animate={{
																			opacity: 1,
																			x: 0,
																		}}
																		transition={{
																			duration: 0.2,
																		}}
																		className="flex items-center gap-3"
																	>
																		<div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full border border-[#141416]">
																			<svg
																				xmlns="http://www.w3.org/2000/svg"
																				className="w-5 h-5 text-purple-600"
																				viewBox="0 0 24 24"
																				fill="currentColor"
																			>
																				<path d="M12 2a1 1 0 011 1v1h2a4 4 0 014 4v3a1 1 0 01-.293.707l-1.207 1.207a4.984 4.984 0 01-1.574.933V18a2 2 0 11-4 0h-2a2 2 0 11-4 0v-3.153a4.984 4.984 0 01-1.574-.933L3.293 11.707A1 1 0 013 11V8a4 4 0 014-4h2V3a1 1 0 011-1zm5 8a3 3 0 10-6 0 3 3 0 006 0z" />
																			</svg>
																		</div>
																		<div>
																			{message.content.startsWith(
																				"#"
																			) ? (
																				<article className="text-sm">
																					<ReactMarkdown
																						remarkPlugins={[
																							remarkGfm,
																						]}
																						components={{
																							h1: ({
																								...props
																							}) => (
																								<h1
																									className="text-xl text-white font-sans font-semibold mb-4"
																									{...props}
																								/>
																							),
																							h2: ({
																								...props
																							}) => (
																								<h2
																									className="text-lg text-white font-sans font-semibold mb-3"
																									{...props}
																								/>
																							),
																							h3: ({
																								...props
																							}) => (
																								<h3
																									className="text-base text-white font-sans font-medium mb-2"
																									{...props}
																								/>
																							),
																							h4: ({
																								...props
																							}) => (
																								<h4
																									className="text-white font-sans font-medium mb-2"
																									{...props}
																								/>
																							),
																							p: ({
																								...props
																							}) => (
																								<p
																									className="text-gray-300 mb-2 whitespace-pre-wrap"
																									{...props}
																								/>
																							),
																							ul: ({
																								...props
																							}) => (
																								<ul
																									className="list-disc list-inside text-gray-300 mb-2"
																									{...props}
																								/>
																							),
																							li: ({
																								...props
																							}) => (
																								<li
																									className="ml-6"
																									{...props}
																								/>
																							),
																							code: ({
																								children,
																								...props
																							}) => (
																								<span
																									className="text-gray-300 px-1 py-1 rounded-md text-sm bg-[#9C88FF30]"
																									{...props}
																								>
																									{
																										children
																									}
																								</span>
																							),
																							strong: ({
																								children,
																							}) => (
																								<span className="text-gray-300">
																									{
																										children
																									}
																								</span>
																							),
																						}}
																					>
																						{
																							message.content
																						}
																					</ReactMarkdown>
																				</article>
																			) : (
																				message.content
																			)}
																		</div>
																	</motion.div>
																)}
															</div>
														)
													)}
												</div>
											</div>
											<div className="w-full md:w-1/2 flex flex-col bg-black border-t md:border-l border-[#141416] h-1/2 md:h-full overflow-hidden">
												<div className="flex-1 p-6 overflow-y-auto">
													<h3 className="text-lg font-medium text-gray-200 mb-4">
														Transaction Preview
													</h3>
													<TransactionPreview
														transactions={
															previewData
														}
													/>
												</div>
											</div>
										</motion.div>
									) : (
										// Initial view content (single instance)
										<motion.div
											key="initial-view"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.3 }}
											className="flex-1 p-6 flex flex-col space-y-6 h-full"
										>
											{/* Initial view content... */}
											<div
												className="flex-1 overflow-y-auto space-y-8 my-20"
												style={{
													maxHeight:
														"calc(100vh - 14rem)",
												}}
											>
												<div className="text-center space-y-2">
													<div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9C88FF]/10 to-[#6C5CE7]/10 flex items-center justify-center mx-auto mb-4">
														<div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7]" />
													</div>
													<h1
														className="text-2xl font-semibold text-gray-200 relative inline-block"
														style={{
															background:
																"linear-gradient(to right, #9C88FF, #6C5CE7, #9C88FF)",
															backgroundSize:
																"200% auto",
															WebkitBackgroundClip:
																"text",
															WebkitTextFillColor:
																"transparent",
															animation:
																"shimmer 3s linear infinite",
														}}
													>
														How can I help you
														today?
													</h1>
													<p className="text-sm text-gray-400">
														You can ask about a
														prompt below or type in
														your own query.
													</p>
												</div>
												<div
													className="flex-1 overflow-y-auto space-y-8"
													style={{
														maxHeight:
															"calc(100vh - 14rem)",
													}}
												>
													{" "}
													<div className="p-8">
														<div className="max-w-3xl mx-auto space-y-4">
															<form
																onSubmit={handleSubmit(
																	() => {
																		handleSend();
																	}
																)}
																className="relative"
															>
																<textarea
																	{...register(
																		"message"
																	)}
																	placeholder="Start a new conversation..."
																	className="rounded-lg w-full h-44 text-md bg-[#1A1A1A] border-[#1A1A1A] focus:outline-none focus:ring-0 transition-shadow p-4 resize-none focus:shadow-[0_0_15px_#9C88FF55]"
																	onChange={(
																		e
																	) =>
																		setPrompt(
																			e
																				.target
																				.value
																		)
																	}
																/>
																<div className="absolute left-3 bottom-3 text-sm text-gray-500">
																	{
																		prompt.length
																	}
																	/2000
																</div>
																<Button
																	type="submit"
																	className="absolute right-3 bottom-3 bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 text-white transition-transform"
																	disabled={
																		isLoading
																	}
																>
																	{isLoading ? (
																		<Loader2 className="w-5 h-5 animate-spin" />
																	) : (
																		<ArrowRight className="w-5 h-5" />
																	)}
																</Button>
															</form>
														</div>
													</div>
													{/* Cards Section */}
													<div className="space-y-4 px-28">
														<h2 className="text-xl font-semibold text-gray-400">
															Suggestions
														</h2>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															{[
																{
																	title: "Fetch Recent Transactions",
																	description:
																		"Retrieve the latest transactions for a specific Solana address in the last 3 days.",
																},
																{
																	title: "Check Biggest Transaction",
																	description:
																		"Retrieve the biggest transaction from a specific wallet in the last 15 days.",
																},
																{
																	title: "Retrieve Wallet Activities",
																	description:
																		"Get a summary of recent activities for a specific wallet including transactions and interactions.",
																},
																{
																	title: "Check Token Transactions",
																	description:
																		"What is the biggest transactions involving a specific token address?",
																},
															].map((card) => (
																<div
																	key={
																		card.title
																	}
																	className="p-4 bg-[#1A1A1A]/50 rounded-lg border-[#141416] hover:bg-[#2b2b2b]/70 transition-colors cursor-pointer"
																>
																	<h3 className="font-bold text-gray-200 mb-2">
																		{
																			card.title
																		}
																	</h3>
																	<p className="text-sm text-gray-400">
																		{
																			card.description
																		}
																	</p>
																</div>
															))}
														</div>
													</div>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				) : (
					<div>
						<Modal
							title="Access Denied"
							redirectPath="/"
							show={true}
						>
							<p className="text-gray-300">
								You don&apos;t own $SWQUERY tokens to access the
								Alpha version of the chatbot. Minimum 20,000
								$SWQUERY tokens are required to access the
								chatbot.
							</p>
						</Modal>
					</div>
				)}
			</div>
			<style jsx>{`
				@keyframes shimmer {
					0% {
						background-position: 0% center;
					}
					50% {
						background-position: 100% center;
					}
					100% {
						background-position: 0% center;
					}
				}
			`}</style>

			<TutorialModal
				isOpen={showTutorial}
				onClose={() => setShowTutorial(false)}
			/>
		</div>
	);
}

export const useTokenAccess = (tokenMintAddress: string, rpcUrl: string) => {
	const wallet = useWallet();
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const memoizedRpcUrl = useMemo(() => rpcUrl, [rpcUrl]);

	useEffect(() => {
		let mounted = true;
		setIsLoading(true);

		const checkOwnership = async () => {
			if (!wallet.publicKey) {
				setHasAccess(false);
				setIsLoading(false);
				return;
			}

			try {
				const connection = new Connection(memoizedRpcUrl, {
					commitment: "confirmed",
					confirmTransactionInitialTimeout: 60000,
				});

				const tokenMint = new PublicKey(tokenMintAddress);
				const associatedTokenAddress = await getAssociatedTokenAddress(
					tokenMint,
					wallet.publicKey
				);

				try {
					const tokenAccount = await getAccount(
						connection,
						associatedTokenAddress
					);
					if (mounted) {
						setHasAccess(tokenAccount.amount >= 20000);
						setIsLoading(false);
					}
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (err) {
					if (mounted) {
						setHasAccess(false);
						setIsLoading(false);
					}
				}
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (err) {
				if (mounted) {
					setHasAccess(false);
					setIsLoading(false);
				}
			}
		};

		checkOwnership();

		return () => {
			mounted = false;
		};
	}, [wallet.publicKey, tokenMintAddress, memoizedRpcUrl]);

	return { hasAccess, isLoading };
};

interface ModalProps {
	title: string;
	children: React.ReactNode;
	redirectPath: string;
	show: boolean;
}

const Modal: React.FC<ModalProps> = ({
	title,
	children,
	redirectPath,
	show,
}) => {
	const router = useRouter();

	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div
				className="bg-gradient-to-br from-zinc-800 to-black rounded-lg shadow-lg p-8 max-w-sm w-full text-center text-gray-200"
				style={{
					background:
						"linear-gradient(135deg, #0b0b0b, #1a1a1a, #000000)",
					backgroundSize: "400% 400%",
				}}
			>
				<h2 className="text-2xl font-semibold mb-4">{title}</h2>
				<div className="mb-6">{children}</div>
				<Button
					onClick={() => router.push(redirectPath)}
					className="w-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 text-white px-6 py-3 rounded-md transition-transform"
				>
					Go to Home
				</Button>
			</div>
		</div>
	);
};
