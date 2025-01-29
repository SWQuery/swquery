"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TokenLaunchCard from "@/components/Atoms/TokenLaunchCard";

// Configuração inicial dos filtros
type FilterKey = "initialBuy" | "marketCapSol" | "vTokensInBondingCurve" | "vSolInBondingCurve";
interface Filter {
  min: number;
  max: number;
}

export default function TokenLaunchTab() {
  const [tokenLaunches, setTokenLaunches] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [keys, setKeys] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [filters, setFilters] = useState<Record<FilterKey, Filter>>({
    initialBuy: { min: 0, max: Infinity },
    marketCapSol: { min: 0, max: Infinity },
    vTokensInBondingCurve: { min: 0, max: Infinity },
    vSolInBondingCurve: { min: 0, max: Infinity },
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Função para conectar ao WebSocket e receber dados em tempo real
  useEffect(() => {
    const socket = new WebSocket("wss://pumpportal.fun/api/data");

    socket.onopen = () => {
      console.log("✅ WebSocket conectado!");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Nova atualização recebida:", data);

      // Adiciona novos tokens recebidos ao estado
      setTokenLaunches((prevLaunches) => {
        const alreadyExists = prevLaunches.some((launch) => launch.mint === data.mint);
        return alreadyExists ? prevLaunches : [data, ...prevLaunches];
      });
    };

    socket.onerror = (error) => {
      console.error("⚠️ Erro no WebSocket:", error);
    };

    socket.onclose = () => {
      console.log("🔌 Conexão WebSocket fechada.");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  // Função para enviar mensagens ao WebSocket
  const sendWebSocketMessage = (method: string) => {
    if (!ws || !keys) return;

    const payload = {
      method: method,
      keys: keys.split(",").map((key) => key.trim()), // Transforma em array de chaves
    };

    ws.send(JSON.stringify(payload));
    console.log(`📤 Enviado para WebSocket: ${JSON.stringify(payload)}`);

    setMethod(method);
  };

  // Aplica os filtros ao apertar o botão "Apply Filters"
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  // Reseta os filtros ao apertar o botão "Reset Filters"
  const handleResetFilters = () => {
    const defaultFilters = {
      initialBuy: { min: 0, max: Infinity },
      marketCapSol: { min: 0, max: Infinity },
      vTokensInBondingCurve: { min: 0, max: Infinity },
      vSolInBondingCurve: { min: 0, max: Infinity },
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  // Filtro dos tokens
  const filteredLaunches = tokenLaunches.filter((launch) => {
    return (
      launch.initialBuy >= appliedFilters.initialBuy.min &&
      launch.initialBuy <= appliedFilters.initialBuy.max &&
      launch.marketCapSol >= appliedFilters.marketCapSol.min &&
      launch.marketCapSol <= appliedFilters.marketCapSol.max &&
      launch.vTokensInBondingCurve >= appliedFilters.vTokensInBondingCurve.min &&
      launch.vTokensInBondingCurve <= appliedFilters.vTokensInBondingCurve.max &&
      launch.vSolInBondingCurve >= appliedFilters.vSolInBondingCurve.min &&
      launch.vSolInBondingCurve <= appliedFilters.vSolInBondingCurve.max
    );
  });

  return (
    <div className="flex">
      {/* Sidebar de Filtros */}
      <div className="w-64 bg-gray-900 text-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        {(["initialBuy", "marketCapSol", "vTokensInBondingCurve", "vSolInBondingCurve"] as FilterKey[]).map(
          (key) => (
            <div key={key}>
              <label className="text-sm font-bold capitalize">{key.replace(/([A-Z])/g, " $1")}:</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="number"
                  className="w-full p-2 bg-gray-800 rounded-lg"
                  placeholder="Min"
                  onChange={(e) => setFilters((prev) => ({ ...prev, [key]: { ...prev[key], min: Number(e.target.value) } }))}
                />
                <input
                  type="number"
                  className="w-full p-2 bg-gray-800 rounded-lg"
                  placeholder="Max"
                  onChange={(e) => setFilters((prev) => ({ ...prev, [key]: { ...prev[key], max: Number(e.target.value) } }))}
                />
              </div>
            </div>
          )
        )}

        <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg" onClick={handleApplyFilters}>
          Apply Filters
        </button>
        <button className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg" onClick={handleResetFilters}>
          Reset Filters
        </button>

        {/* Input para chaves */}
        <div className="mt-4">
          <label className="text-sm font-bold">Enter Keys (comma-separated):</label>
          <input
            type="text"
            value={keys}
            onChange={(e) => setKeys(e.target.value)}
            placeholder="e.g., key1, key2"
            className="w-full p-2 bg-gray-800 rounded-lg mt-1"
          />
        </div>

        {/* Botões de subscribe/unsubscribe */}
        <div className="space-y-2 mt-4">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg" onClick={() => sendWebSocketMessage("subscribeNewToken")}>
            Subscribe New Token
          </button>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg" onClick={() => sendWebSocketMessage("unsubscribeNewToken")}>
            Unsubscribe New Token
          </button>
        </div>
      </div>

      {/* Cards de Token Launch */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 gap-6 flex-1 ml-6">
        {filteredLaunches.map((launch, index) => (
          <TokenLaunchCard key={index} launch={launch} />
        ))}
      </motion.div>
    </div>
  );
}