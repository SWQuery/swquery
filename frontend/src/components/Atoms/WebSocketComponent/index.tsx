'use client';

import { useState, useEffect } from "react";

interface WebSocketComponentProps {
  onDataUpdate: (data: unknown) => void;
}

const WebSocketComponent = ({ onDataUpdate }: WebSocketComponentProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [keys, setKeys] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket("wss://pumpportal.fun/api/data");

    socket.onopen = () => {
      console.log("WebSocket conectado!");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onDataUpdate(data);
    };

    socket.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };

    socket.onclose = () => {
      console.log("Conexão WebSocket fechada.");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [onDataUpdate]);

  const sendWebSocketMessage = (method: string) => {
    if (!ws || !keys) return;

    const payload = {
      method,
      keys: keys.split(",").map((key) => key.trim()),
    };

    ws.send(JSON.stringify(payload));
  };

  return (
    <div style={{ padding: "20px", display: "none" }}>
      <input
        type="text"
        value={keys}
        onChange={(e) => setKeys(e.target.value)}
        placeholder="Enter keys"
      />
      <button onClick={() => sendWebSocketMessage("subscribeNewToken")}>
        Subscribe New Token
      </button>
    </div>
  );
};

export default WebSocketComponent;