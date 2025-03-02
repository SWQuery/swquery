"use client";

import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Navbar } from "@/components/Molecules/Navbar";
import TokenLaunchTab from "@/components/Molecules/TokenLaunchTab";

export default function RealTimeMonitor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabItems = [
    { label: "Token Launches", disabled: false },
    { label: "My Tokens", disabled: true },
    { label: "My Wallets", disabled: true },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-8">
        <h1 className="text-3xl font-bold mb-8 mt-24">
          Real-Time Transaction Monitor
        </h1>

        <TabGroup onChange={setActiveTab}>
          <TabList className="flex space-x-4 mb-8">
            {tabItems.map((item, index) => (
              <Tab
                key={index}
                disabled={item.disabled}
                className={({ selected }) =>
                  `px-4 py-2 rounded-lg transition-all ${
                    selected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`
                }
              >
                {item.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel>
              <TokenLaunchTab />
            </TabPanel>
            {/* <Tab.Panel>
              <TokenTab />
            </Tab.Panel>
            <Tab.Panel>
              <WalletTab />
            </Tab.Panel> */}
          </TabPanels>
        </TabGroup>
      </div>
    </>
  );
}