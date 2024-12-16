"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Search, Settings } from "lucide-react";
import { TransactionPreview } from "@/components/TransactionPreview";

const sampleTransactions = [
  { amount: "0.00001", recipient: "2nu...UQc4", date: "Dec 15, 2024" },
  { amount: "0.00001", recipient: "2nu...UQc4", date: "Dec 14, 2024" },
  { amount: "0.00001", recipient: "2nu...UQc4", date: "Dec 10, 2024" },
];

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

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const handleSend = () => {
    if (prompt.trim()) {
      const newChat: Chat = {
        id: Date.now(),
        name: prompt,
        messages: [
          { content: prompt, isUser: true },
          {
            content:
              "I understand your question. Here are the recent transactions I found:",
            isUser: false,
          },
        ],
      };
      setChats([...chats, newChat]);
      setCurrentChatId(newChat.id);
      setPrompt("");
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setPrompt("");
  };

  return (
    <div className="flex h-screen bg-black">
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
            <div className="text-sm text-gray-400 font-medium mt-6">Chats</div>
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-300 hover:bg-[#2b2b2b]",
                  currentChatId === chat.id && "bg-[#1A1A1A]"
                )}
                onClick={() => setCurrentChatId(chat.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {chat.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 mt-auto border-t border-[#141416]">
          <Button
            onClick={startNewChat}
            className="w-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:bg-purple-700 text-white gap-2"
            // className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] px-6 py-3 rounded-full hover:opacity-80 transition-all shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-900 to-black">
        {currentChat ? (
          <div className="flex-1 flex">
            {/* Left panel - Chat */}
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
                    // User message
                    <p className="bg-[#1A1A1A]/50 border border-[#141416] rounded-lg p-4 text-gray-200">
                      {message.content}
                    </p>
                  ) : (
                    // Chatbot message
                    <div className="flex items-center gap-3">
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
                      {/* Chatbot response */}
                      <p className="text-gray-300">{message.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right panel - Preview*/}
            <div className="w-1/2 flex flex-col bg-black border-l border-[#141416]">
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-200 mb-4">
                  Transaction Preview
                </h3>
                <TransactionPreview transactions={sampleTransactions} />
              </div>
            </div>
          </div>
        ) : (
          // Initial view
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 rounded-full  bg-gradient-to-r from-[#9C88FF]/10 to-[#6C5CE7]/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7]" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-200">
                  How can I help you today?
                </h1>
                <p className="text-sm text-gray-400">
                  You can ask about a prompt below or type in your own query.
                  I&apos;ll try my best to provide a good response based on the mode
                  selected below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Lorem ipsun",
                    description:
                      "Lorem ipsun dolor sit amet, consectetur adipiscing elit",
                  },
                  {
                    title: "Lorem ipsun",
                    description:
                      "Lorem ipsun dolor sit amet, consectetur adipiscing elit",
                  },
                  {
                    title: "Lorem ipsun",
                    description:
                      "Lorem ipsun dolor sit amet, consectetur adipiscing elit",
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
          </div>
        )}

        {!currentChat && (
          <div className="p-6 border-t border-[#141416]">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your prompt here..."
                  className="flex-1 bg-[#1A1A1A] border-[#141416]"
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] hover:bg-purple-700 text-white px-8"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
