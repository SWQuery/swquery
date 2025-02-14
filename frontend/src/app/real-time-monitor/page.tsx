"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";
import { Navbar } from "@/components/Molecules/Navbar";
import TokenTab from "@/components/Molecules/TokenTab";
import WalletTab from "@/components/Molecules/WalletTab";
import TokenLaunchTab from "@/components/Molecules/TokenLaunchTab";

export default function RealTimeMonitor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<number>(0);
  // const tabItems = ["Token Launches", "My Tokens", "My Wallets"];
  const tabItems = ["Token Launches"];


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-8">
        <h1 className="text-3xl font-bold mb-8 mt-24">
          Real-Time Transaction Monitor
        </h1>

        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex space-x-4 mb-8">
            {tabItems.map((item, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `px-4 py-2 rounded-lg transition-all ${
                    selected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`
                }
              >
                {item}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <TokenLaunchTab />
            </Tab.Panel>
            {/* <Tab.Panel>
              <TokenTab />
            </Tab.Panel>
            <Tab.Panel>
              <WalletTab />
            </Tab.Panel> */}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}
