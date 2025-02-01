/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/Atoms/Buttons/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, MessageSquarePlus, X } from "lucide-react";
import { TransactionPreview } from "@/components/Molecules/TransactionPrev/TransactionPreview";
import { Navbar } from "@/components/Molecules/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/services/config/api";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCookie } from "cookies-next/client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import PricingModal from "@/components/Atoms/PricingModal";

async function interactChatbot(input_user: string, address: string) {
  try {
    const openai_key = getCookie("openai_key");
    const helius_key = getCookie("helius_key");

    if (!openai_key || !helius_key) {
      throw new Error("API keys are missing");
    }

    const response = await api.post(
      "https://api.swquery.xyz/chatbot/interact",
      {
        input_user,
        address,
        helius_key,
        openai_key,
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

interface UsageResponse {
  remaining_credits: number;
  total_spent_usdc: number;
  last_transaction?: {
    package_id: string;
    amount_usdc: number;
    created_at: number;
  };
}

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [fetchedTransactions, setFetchedTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);

  const { connected, publicKey } = useWallet();

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  function mapHeliusResponseToPreviewData(transactions: any[]) {
    const fullTransactions: any = [];
    transactions.forEach((tx: any) => {
      tx.details?.transfers?.forEach((transfer: any) => {
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
      const llmAnswer = json.report || "Here are the transactions I found:";
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("There was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  }

  const previewData = mapHeliusResponseToPreviewData(fetchedTransactions);

  const { register, handleSubmit } = useForm();

  const handleCloseChat = () => {
    setCurrentChatId(null);
    setFetchedTransactions([]);
    setPrompt("");
  };

  const fetchUsageData = useCallback(async () => {
    try {
      const response = await api.get<UsageResponse>(
        `/users/${publicKey}/usage`
      );
      setUsageData(response.data);
    } catch (error) {
      console.error("Error fetching usage data:", error);
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchUsageData();
    }
  }, [fetchUsageData, publicKey]);

  useEffect(() => {
    if (isPricingModalOpen) {
      fetchUsageData();
    }
  }, [fetchUsageData, isPricingModalOpen]);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Fundo com Efeito 3D */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: "linear-gradient(135deg, #0b0b0b, #1a1a1a, #000000)",
          backgroundSize: "400% 400%",
          perspective: "1000px",
          transform: "translateZ(0) scale(1.1)",
        }}
        transition={{ duration: 2 }}
      >
        {/* Camada adicional para profundidade */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          style={{
            background:
              "radial-gradient(circle at center, rgba(156, 136, 255, 0.1), transparent 70%)",
            transform: "translateZ(-1px) scale(2)",
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        {}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          style={{
            background:
              "radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent 80%)",
            transform: "translateZ(-2px) scale(3)",
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
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

      <div className="relative z-20 flex flex-col h-screen bg-black/70 backdrop-blur-md">
        <Navbar />
        <div className="flex flex-1 h-[calc(100vh-5rem)] bg-black">
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
                    {/* Botão de fechar chat */}
                    <Button
                      onClick={handleCloseChat}
                      className="absolute top-4 right-4 bg-transparent p-3 rounded-full hover:bg-gray-800 transition-colors z-50"
                      aria-label="Close Chat"
                    >
                      <X className="w-8 h-8 text-gray-400 hover:text-white" />
                    </Button>
                    <Button
                      onClick={handleCloseChat}
                      className="fixed left-1/2 transform -translate-x-1/2 px-4 py-2 bottom-4 bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-110 text-white transition-transform z-50 flex items-center gap-2"
                    >
                      <MessageSquarePlus size={16} />
                      New Chat
                    </Button>

                    <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto">
                      <div className="p-6 space-y-4">
                        {currentChat.messages.map((message, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-start gap-3",
                              message.isUser ? "justify-end" : "justify-start"
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
                                {message.content}
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
                                  {message.content.startsWith("#") ? (
                                    <article className="text-sm">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                          h1: ({ ...props }) => (
                                            <h1
                                              className="text-xl text-white font-sans font-semibold mb-4"
                                              {...props}
                                            />
                                          ),
                                          h2: ({ ...props }) => (
                                            <h2
                                              className="text-lg text-white font-sans font-semibold mb-3"
                                              {...props}
                                            />
                                          ),
                                          h3: ({ ...props }) => (
                                            <h3
                                              className="text-base text-white font-sans font-medium mb-2"
                                              {...props}
                                            />
                                          ),
                                          h4: ({ ...props }) => (
                                            <h4
                                              className="text-white font-sans font-medium mb-2"
                                              {...props}
                                            />
                                          ),
                                          p: ({ ...props }) => (
                                            <p
                                              className="text-gray-300 mb-2 whitespace-pre-wrap"
                                              {...props}
                                            />
                                          ),
                                          ul: ({ ...props }) => (
                                            <ul
                                              className="list-disc list-inside text-gray-300 mb-2"
                                              {...props}
                                            />
                                          ),
                                          li: ({ ...props }) => (
                                            <li className="ml-6" {...props} />
                                          ),
                                          code: ({ children, ...props }) => (
                                            <span
                                              className="text-gray-300 px-1 py-1 rounded-md text-sm bg-[#9C88FF30]"
                                              {...props}
                                            >
                                              {children}
                                            </span>
                                          ),
                                          strong: ({ children }) => (
                                            <span className="text-gray-300">
                                              {children}
                                            </span>
                                          ),
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    </article>
                                  ) : (
                                    message.content
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col bg-black border-t md:border-l border-[#141416] h-1/2 md:h-full overflow-hidden">
                      <div className="flex-1 p-6 overflow-y-auto">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">
                          Transaction Preview
                        </h3>
                        <TransactionPreview transactions={previewData} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Initial view content
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
                        maxHeight: "calc(100vh - 14rem)",
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
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "shimmer 3s linear infinite",
                          }}
                        >
                          How can I assist you today?
                        </h1>
                        <p className="text-sm text-gray-400">
                          You can ask about a prompt below or type in your own
                          query.
                        </p>
                        {/* <button
														onClick={() =>
															setPricingModalOpen(
																true
															)
														}
														className="px-6 py-2 bg-purple-600 text-white rounded-lg"
													>
														Open Pricing Modal
													</button> */}
                      </div>
                      <div
                        className="flex-1 overflow-y-auto space-y-8"
                        style={{
                          maxHeight: "calc(100vh - 14rem)",
                        }}
                      >
                        <div className="p-8">
                          <div className="max-w-3xl mx-auto space-y-4">
                            <form
                              onSubmit={handleSubmit(() => {
                                handleSend();
                              })}
                              className="relative"
                            >
                              {/* Caixa de Prompt com Borda Brilhante e Efeito Rotativo */}
                              <div className="relative">
                                <textarea
                                  {...register("message")}
                                  placeholder={
                                    usageData?.remaining_credits
                                      ? "Type your message..."
                                      : "You need to buy credits to continue chatting..."
                                  }
                                  className={cn(
                                    "w-full h-32 p-4 text-white bg-black/50 backdrop-blur-md rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9C88FF] transition-all",
                                    "placeholder-gray-500",
                                    !usageData?.remaining_credits &&
                                      "cursor-not-allowed opacity-50"
                                  )}
                                  maxLength={2000}
                                  onChange={(e) => setPrompt(e.target.value)}
                                  disabled={!usageData?.remaining_credits}
                                />
                                {!usageData?.remaining_credits && (
                                  <div
                                    onClick={() => setPricingModalOpen(true)}
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                                  >
                                    <div className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                      Buy Credits
                                    </div>
                                  </div>
                                )}
                                {/* Borda Animada */}
                                <div className="absolute inset-0 rounded-lg border-4 border-transparent animate-border-gradient"></div>
                                {/* Contador de Caracteres */}
                                <div className="absolute left-4 bottom-4 text-sm text-gray-500 z-20">
                                  {prompt.length}
                                  /2000
                                </div>
                                {/* Botão de Enviar */}
                                <div className="absolute right-4 bottom-4 z-20">
                                  <Button
                                    type="submit"
                                    className={cn(
                                      "bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 text-white p-2 rounded-full flex items-center justify-center transition-transform",
                                      !usageData?.remaining_credits &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                    disabled={
                                      isLoading || !usageData?.remaining_credits
                                    }
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <ArrowRight className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Show how many credits are left or if you need to buy credits */}
                              {usageData?.remaining_credits ? (
                                <p className="text-sm text-gray-400">
                                  {usageData?.remaining_credits} credits left
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400">
                                  You need to buy credits to continue
                                  chatting...
                                </p>
                              )}
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
                                key={card.title}
                                className="p-4 bg-[#1A1A1A]/50 rounded-lg border-[#141416] hover:bg-[#2b2b2b]/70 transition-colors cursor-pointer"
                              >
                                <h3 className="font-bold text-gray-200 mb-2">
                                  {card.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {card.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-center mt-6">
                          <Button
                            asChild
                            className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 text-white px-6 py-2 rounded-lg transition-transform"
                          >
                            <Link href="/dashboard">Manage Your Credits</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        onPurchaseSuccess={fetchUsageData}
      />
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
        @keyframes borderGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-border-gradient {
          border-radius: 0.5rem;
          background: linear-gradient(
            45deg,
            #9c88ff,
            #6c5ce7,
            #9c88ff,
            #6c5ce7
          );
          background-size: 400% 400%;
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          animation: borderGradient 8s linear infinite;
        }

        /* Estilo adicional para o background com efeito 3D */
        @keyframes rotateBackground {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Opcional: Adicionando animação de rotação suave ao fundo */
        .background-rotation {
          animation: rotateBackground 60s linear infinite;
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 5px #9c88ff, 0 0 10px #9c88ff, 0 0 15px #9c88ff,
              0 0 20px #9c88ff;
          }
          50% {
            box-shadow: 0 0 10px #6c5ce7, 0 0 20px #6c5ce7, 0 0 30px #6c5ce7,
              0 0 40px #6c5ce7;
          }
          100% {
            box-shadow: 0 0 5px #9c88ff, 0 0 10px #9c88ff, 0 0 15px #9c88ff,
              0 0 20px #9c88ff;
          }
        }

        .glow-border {
          animation: glow 2s infinite alternate;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
