/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/Atoms/Buttons/button";
import { Input } from "@/components/Atoms/input";
import { ScrollArea } from "@/components/Atoms/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Search, Menu, X } from "lucide-react";
import { TransactionPreview } from "@/components/Molecules/TransactionPrev/TransactionPreview";
import { Navbar } from "@/components/Molecules/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/services/config/api";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

async function interactChatbot(input_user: string, address: string) {
	try {
		const response = await api.post(
			"http://localhost:5500/chatbot/interact",
			{
				input_user,
				address,
				helius_key: "d8c43267-ec7d-4930-8668-5039b78bdf89",
				openai_key: "OPEN_AI",
			},
			{
				headers: {
					"Content-Type": "application/json",
					"x-api-key": "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM",
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

	const { connected } = useWallet();
	const publicKey = "2nuW7MWYsGdLmsSf5mHrjgn6NqyrS5USai6fdisnUQc4";

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

	function startNewChat() {
		setCurrentChatId(null);
		setPrompt("");
	}

	return (
		<div className="relative flex flex-col h-screen overflow-hidden">
			<Toaster position="top-right" reverseOrder={false} />
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
				<div className="flex flex-1 h-[calc(100vh-5rem)] bg-black mt-20">
					{/* Mobile backdrop */}
					{isSidebarOpen && (
						<div
							className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
							onClick={() => setIsSidebarOpen(false)}
						/>
					)}
					{/* Sidebar */}
					<div
						className={`${
							isSidebarOpen
								? "translate-x-0"
								: "-translate-x-full"
						} md:translate-x-0 fixed md:static left-0 top-20 h-[calc(100vh-5rem)] md:h-full w-80 border-r border-[#141416] flex flex-col bg-black z-[60] transition-transform duration-300 ease-in-out`}
					>
						<div className="p-4 flex items-center justify-between border-b border-[#141416]">
							<div className="flex items-center gap-2">
								<MessageSquare className="w-5 h-5 text-gray-400" />
								<span className="text-gray-200">My Chats</span>
							</div>
							<button
								onClick={() => setIsSidebarOpen(false)}
								className="md:hidden p-2 rounded-full hover:bg-[#2b2b2b] transition-colors"
							>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						</div>
						<div className="p-4">
							<div className="relative">
								<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
								<Input
									placeholder="Search"
									className="pl-9 bg-[#1A1A1A] border-[#141416]"
								/>
							</div>
						</div>
						<ScrollArea className="flex-1 px-4">
							<div className="space-y-4">
								<div className="text-sm text-gray-400 font-medium mt-6">
									Chats
								</div>
								<AnimatePresence>
									{chats.map((chat) => (
										<motion.div
											key={chat.id}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											transition={{ duration: 0.2 }}
										>
											<Button
												variant="ghost"
												className={cn(
													"w-full justify-start text-gray-300 hover:bg-[#2b2b2b] transition-colors",
													currentChatId === chat.id &&
														"bg-[#1A1A1A]"
												)}
												onClick={() =>
													setCurrentChatId(chat.id)
												}
											>
												<MessageSquare className="mr-2 h-4 w-4" />
												{chat.name}
											</Button>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</ScrollArea>
						<div className="p-4 border-t border-[#141416]">
							<Button
								onClick={startNewChat}
								className="w-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 hover:opacity-90 text-white gap-2 transition-transform"
							>
								<Plus className="h-4 w-4" />
								New Chat
							</Button>
						</div>
					</div>
					<div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-900 to-black">
						{/* Sidebar toggle button for mobile */}
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className={`md:hidden fixed top-24 left-4 z-50 p-2 bg-transparent rounded-full inline-flex items-center justify-center transition-opacity duration-300 ${
								isSidebarOpen
									? "opacity-0 pointer-events-none"
									: "opacity-100"
							}`}
						>
							<Menu className="w-6 h-6 text-gray-400" />
						</button>
						<div className="flex-1 overflow-hidden">
							<AnimatePresence mode="wait">
								{currentChat ? (
									<motion.div
										key="chat-view"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
										className="flex flex-col md:flex-row h-full"
									>
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
													transactions={previewData}
												/>
											</div>
										</div>
									</motion.div>
								) : (
									<motion.div
										key="initial-view"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
										className="flex-1 p-6 flex flex-col space-y-6 h-full"
									>
										<div
											className="flex-1 overflow-y-auto space-y-8"
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
													How can I help you today?
												</h1>
												<p className="text-sm text-gray-400">
													You can ask about a prompt
													below or type in your own
													query.
												</p>
											</div>

											{/* Cards Section */}
											<div className="flex flex-wrap gap-4 justify-center">
												{[
													{
														title: "Track Wallet Transactions",
														description:
															"Effortlessly retrieve and analyze Solana wallet transactions using natural language queries. Perfect for building accessible blockchain experiences.",
													},
													{
														title: "Optimize DeFi Integrations",
														description:
															"Simplify the integration of on-chain data into DeFi platforms with intuitive SDK tools that translate complex data into human-readable formats.",
													},
												].map((card) => (
													<div
														key={card.title}
														className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-4 bg-[#1A1A1A]/50 border-[#141416] hover:bg-[#2b2b2b]/70 transition-colors cursor-pointer"
													>
														<h3 className="font-medium text-gray-200 mb-2">
															{card.title}
														</h3>
														<div className="h-24 overflow-auto">
															<p className="text-sm text-gray-400">
																{
																	card.description
																}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						<div className="p-6 border-t border-[#141416]">
							<div className="max-w-2xl mx-auto space-y-4">
								<div className="flex flex-col md:flex-row gap-2">
									<Input
										value={prompt}
										onChange={(e) =>
											setPrompt(e.target.value)
										}
										placeholder="Type your prompt here..."
										className="flex-1 bg-[#1A1A1A] border-[#141416] focus:ring-2 focus:ring-[#9C88FF] transition-shadow hover:shadow-[0_0_10px_#9C88FF55]"
									/>
									<Button
										onClick={handleSend}
										className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 text-white px-8 transition-transform"
										disabled={isLoading}
									>
										{isLoading ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											"Send"
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
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
		</div>
	);
}
