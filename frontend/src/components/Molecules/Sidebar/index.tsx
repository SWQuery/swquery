import type React from "react"
import { MessageSquare, Wallet, BarChart2, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const menuItems = [
    { id: "chatbot", icon: MessageSquare, label: "On-Chain Chatbot" },
    { id: "wallet", icon: Wallet, label: "Wallet Manager", comingSoon: true },
    { id: "token", icon: BarChart2, label: "Token Analysis", comingSoon: true },
    { id: "monitor", icon: Activity, label: "Real Time Monitor", comingSoon: true },
  ]

  return (
    <div className="w-64 h-full bg-black/80 backdrop-blur-md border-r border-black/80">
      <div className="pt-40">
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors",
                    activeItem === item.id ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-600",
                    item.comingSoon && "opacity-50 cursor-not-allowed",
                  )}
                  disabled={item.comingSoon}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.comingSoon && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full ml-auto">Soon</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar