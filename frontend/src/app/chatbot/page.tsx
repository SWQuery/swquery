"use client";

import { useState } from "react";
import { Button } from "@/components/Atoms/Buttons/button";
import { Card } from "@/components/Atoms/card";
import { Input } from "@/components/Atoms/input";
import { ScrollArea } from "@/components/Atoms/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Search } from "lucide-react";
import { TransactionPreview } from "@/components/Molecules/TransactionPrev/TransactionPreview";
import { Navbar } from "@/components/Molecules/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/services/config/api";


 /* Faz a chamada à rota chatbot/interact,
 * enviando o prompt (input_user) e address da carteira.
 */
async function interactChatbot(input_user: string, address: string) {
  try {
    const response = await api.post(
      "http://localhost:5500/chatbot/interact",
      { input_user, address },
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// COMPONENTE PRINCIPAL
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [fetchedTransactions, setFetchedTransactions] = useState<any[]>([]);

// Hook para acessar dados da wallet do usuário (publicKey, etc.)
  const { connected } = useWallet();
//publicKey real: const { publicKey } = useWallet();
  // Aqui está fixo como exemplo:
  const publicKey = "2nuW7MWYsGdLmsSf5mHrjgn6NqyrS5USai6fdisnUQc4";

  // Localiza o chat atual (caso exista)
  const currentChat = chats.find((chat) => chat.id === currentChatId);

  /**
   * Mapeia o array de transações retornado pela rota /chatbot/interact
   * para o formato compatível com o componente TransactionPreview
   */
  function mapHeliusResponseToPreviewData(transactions: any[]) {
    return transactions.map((tx) => {
      const firstTransfer = tx.details?.transfers?.[0];
      return {
        amount: firstTransfer?.amount ?? "0",
        recipient: tx.signature?.slice(0, 6) + "..." || "",
        date: new Date(tx.timestamp * 1000).toLocaleString(),
        direction: firstTransfer?.direction,
        fee: tx.details?.fee,
        status: tx.status,
        mint: firstTransfer?.mint,
      };
    });
  }

  /**
   * Envia o prompt do usuário e o endereço (publicKey) para a rota /chatbot/interact.
   * Após receber a resposta, cria um novo chat e salva as transações retornadas no state.
   */
  async function handleSend() {
    if (!prompt.trim()) return; // Evita requests vazias
    if (!connected || !publicKey) {
      alert("É preciso ter uma carteira conectada!");
      return;
    }

    try {
      // Chama a função que faz POST para /chatbot/interact
      const json = await interactChatbot(prompt, publicKey.toString());

      // Extrai a resposta textual (se existir) ou usa um fallback
      const llmAnswer = json.report || "Aqui estão as transações que encontrei:";

      // Cria um novo objeto Chat com duas mensagens (usuário e LLM)
      const newChat: Chat = {
        id: Date.now(),
        name: prompt,
        messages: [
          { content: prompt, isUser: true },
          { content: llmAnswer, isUser: false },
        ],
      };

      // Salva esse chat e define como 'chat atual'
      setChats((prev) => [...prev, newChat]);
      setCurrentChatId(newChat.id);

      // Mapeia as transações retornadas e armazena
      const heliusTxs = Array.isArray(json.response) ? json.response : [];
      setFetchedTransactions(heliusTxs);

      // Limpa o prompt
      setPrompt("");
    } catch (error) {
      console.error("Erro ao enviar prompt:", error);
      alert("Houve um erro ao processar sua solicitação.");
    }
  }

  // Processa as transações armazenadas para exibir no TransactionPreview
  const previewData = mapHeliusResponseToPreviewData(fetchedTransactions);

  // Inicia um novo chat em branco
  function startNewChat() {
    setCurrentChatId(null);
    setPrompt("");
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Fundo animado principal */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: "linear-gradient(135deg, #0b0b0b, #1a1a1a, #000000)",
          backgroundSize: "400% 400%",
        }}
        transition={{ duration: 2 }}
      />

      {/* Linha de varredura no fundo */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        style={{
          background: "linear-gradient(to right, transparent, #9C88FF15, transparent)",
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

      {/* Conteúdo principal (blur background) */}
      <div className="relative z-10 flex flex-col h-screen bg-black/70 backdrop-blur-md">
        <Navbar />

        <div className="flex h-screen bg-black mt-20">
          {/* Sidebar */}
          <div className="w-80 border-r border-[#141416] flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[#141416]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span className="text-gray-200">My Chats</span>
              </div>
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
                          currentChatId === chat.id && "bg-[#1A1A1A]"
                        )}
                        onClick={() => setCurrentChatId(chat.id)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {chat.name}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="p-4 mt-auto border-t border-[#141416]">
              <Button
                onClick={startNewChat}
                className="w-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 hover:opacity-90 text-white gap-2 transition-transform"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Main Content (chat + preview) */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-900 to-black">
            <AnimatePresence mode="wait">
              {currentChat ? (
                <motion.div
                  key="chat-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex"
                >
                  {/* Painel esquerdo: Chat */}
                  <div className="w-1/2 p-6 space-y-4 overflow-y-auto">
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#1A1A1A]/50 border border-[#141416] rounded-lg p-4 text-gray-200"
                          >
                            {message.content}
                          </motion.p>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
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
                            <p className="text-gray-300">{message.content}</p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Painel direito: Preview de transações */}
                  <div className="w-1/2 flex flex-col bg-black border-l border-[#141416]">
                    <div className="flex-1 p-6 overflow-y-auto">
                      <h3 className="text-lg font-medium text-gray-200 mb-4">
                        Transaction Preview
                      </h3>
                      <TransactionPreview transactions={previewData} />
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
                  className="flex-1 p-6 flex items-center justify-center"
                >
                  {/* Tela inicial sem chat selecionado */}
                  <div className="max-w-2xl w-full space-y-8">
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
                        How can I help you today?
                      </h1>
                      <p className="text-sm text-gray-400">
                        You can ask about a prompt below or type in your own query.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Lorem ipsum",
                          description:
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                        },
                        {
                          title: "Lorem ipsum",
                          description:
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                        },
                        {
                          title: "Lorem ipsum",
                          description:
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                        },
                      ].map((card) => (
                        <Card
                          key={card.title}
                          className="p-4 bg-[#1A1A1A]/50 border-[#141416] hover:bg-[#2b2b2b]/70 transition-colors cursor-pointer"
                        >
                          <h3 className="font-medium text-gray-200 mb-2">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-400">{card.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!currentChat && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 border-t border-[#141416]"
              >
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Type your prompt here..."
                      className="flex-1 bg-[#1A1A1A] border-[#141416] focus:ring-2 focus:ring-[#9C88FF] transition-shadow hover:shadow-[0_0_10px_#9C88FF55]"
                    />
                    <Button
                      onClick={handleSend}
                      className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:scale-105 text-white px-8 transition-transform"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
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
