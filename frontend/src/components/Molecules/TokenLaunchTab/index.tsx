// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import TokenLaunchCard from "@/components/Atoms/TokenLaunchCard";
// import { Loader } from "lucide-react";

// type FilterKey =
//   | "initialBuy"
//   | "marketCapSol"
//   | "vTokensInBondingCurve"
//   | "vSolInBondingCurve";
// interface Filter {
//   min: number;
//   max: number;
// }

// export default function TokenLaunchTab() {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [tokenLaunches, setTokenLaunches] = useState<any[]>([]);
//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const [filters, setFilters] = useState<Record<FilterKey, Filter>>({
//     initialBuy: { min: 0, max: Infinity },
//     marketCapSol: { min: 0, max: Infinity },
//     vTokensInBondingCurve: { min: 0, max: Infinity },
//     vSolInBondingCurve: { min: 0, max: Infinity },
//   });
//   const [appliedFilters, setAppliedFilters] = useState(filters);
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const startWebSocket = () => {
//     if (ws || isLoading) {
//       console.warn("WebSocket already running or loading!");
//       return;
//     }

//     setIsLoading(true);

//     const socket = new WebSocket("wss://pumpportal.fun/api/data");

//     socket.onopen = () => {
//       console.log("✅ WebSocket connected!");
//       setIsMonitoring(true);
//       setIsLoading(false);

//       const payload = {
//         method: "subscribeNewToken",
//         keys: ["a"],
//       };
//       socket.send(JSON.stringify(payload));
//       console.log(`📤 Sent to WebSocket: ${JSON.stringify(payload)}`);
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("📩 New update received:", data);

//       setTokenLaunches((prevLaunches) => {
//         const alreadyExists = prevLaunches.some(
//           (launch) => launch.mint === data.mint
//         );
//         return alreadyExists ? prevLaunches : [data, ...prevLaunches];
//       });
//     };

//     socket.onerror = (error) => {
//       console.error("⚠️ WebSocket error:", error);
//       setIsLoading(false);
//     };

//     socket.onclose = () => {
//       console.log("🔌 WebSocket connection closed.");
//       setIsMonitoring(false);
//       setWs(null);
//       setIsLoading(false);
//     };

//     setWs(socket);
//   };

//   const handleApplyFilters = () => {
//     setAppliedFilters(filters);
//   };

//   const handleResetFilters = () => {
//     const defaultFilters = {
//       initialBuy: { min: 0, max: Infinity },
//       marketCapSol: { min: 0, max: Infinity },
//       vTokensInBondingCurve: { min: 0, max: Infinity },
//       vSolInBondingCurve: { min: 0, max: Infinity },
//     };
//     setFilters(defaultFilters);
//     setAppliedFilters(defaultFilters);
//   };

//   const filteredLaunches = tokenLaunches.filter((launch) => {
//     return (
//       launch.initialBuy >= appliedFilters.initialBuy.min &&
//       launch.initialBuy <= appliedFilters.initialBuy.max &&
//       launch.marketCapSol >= appliedFilters.marketCapSol.min &&
//       launch.marketCapSol <= appliedFilters.marketCapSol.max &&
//       launch.vTokensInBondingCurve >=
//         appliedFilters.vTokensInBondingCurve.min &&
//       launch.vTokensInBondingCurve <=
//         appliedFilters.vTokensInBondingCurve.max &&
//       launch.vSolInBondingCurve >= appliedFilters.vSolInBondingCurve.min &&
//       launch.vSolInBondingCurve <= appliedFilters.vSolInBondingCurve.max
//     );
//   });

//   return (
//     <div className="flex">
//       <div className="w-64 p-4 rounded-lg bg-[#161616] border border-[#414141] 
//                       shadow-[0_0_25px_#8F00FF55] mb-4 text-white">
//         <div className="mt-4">
//           <button
//             className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
//               isMonitoring
//                 ? "bg-gray-600 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             } text-white`}
//             onClick={startWebSocket}
//             disabled={isMonitoring || isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader className="w-5 h-5 animate-spin" />
//                 Starting...
//               </>
//             ) : isMonitoring ? (
//               "Monitoring Active"
//             ) : (
//               "Start Launches Monitor"
//             )}
//           </button>
//         </div>
//         <h2 className="text-lg font-semibold my-4">Filters</h2>
//         {(
//           [
//             "initialBuy",
//             "marketCapSol",
//             "vTokensInBondingCurve",
//             "vSolInBondingCurve",
//           ] as FilterKey[]
//         ).map((key) => (
//           <div key={key}>
//             <label className="text-sm font-bold capitalize">
//               {key.replace(/([A-Z])/g, " $1")}:
//             </label>
//             <div className="flex space-x-2 mt-1">
//               <input
//                 type="number"
//                 className="w-full p-2 bg-[#1A1A1A] rounded-lg"
//                 placeholder="Min"
//                 onChange={(e) =>
//                   setFilters((prev) => ({
//                     ...prev,
//                     [key]: { ...prev[key], min: Number(e.target.value) },
//                   }))
//                 }
//               />
//               <input
//                 type="number"
//                 className="w-full p-2 bg-[#1A1A1A] rounded-lg"
//                 placeholder="Max"
//                 onChange={(e) =>
//                   setFilters((prev) => ({
//                     ...prev,
//                     [key]: { ...prev[key], max: Number(e.target.value) },
//                   }))
//                 }
//               />
//             </div>
//           </div>
//         ))}

//         <button
//           className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
//           onClick={handleApplyFilters}
//         >
//           Apply Filters
//         </button>
//         <button
//           className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
//           onClick={handleResetFilters}
//         >
//           Reset Filters
//         </button>
//       </div>

//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.5 }}
//         className="grid grid-cols-1 gap-6 flex-1 ml-6"
//       >
//         {filteredLaunches.map((launch, index) => (
//           <TokenLaunchCard key={index} launch={launch} />
//         ))}
//       </motion.div>
//     </div>
//   );
// }