'use client'
import { useState, useEffect } from "react";

// WebSocket Component
const WebSocketComponent = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>('');
  const [keys, setKeys] = useState<string>('');
  const [method, setMethod] = useState<string>('');
  const [response, setResponse] = useState<any[]>([]);

  // Function to establish WebSocket connection
  useEffect(() => {
    const socket = new WebSocket('wss://pumpportal.fun/api/data');

    socket.onopen = () => {
      console.log('WebSocket conectado!');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResponse((prevMessages) => [...prevMessages, data]);
    };

    socket.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    socket.onclose = () => {
      console.log('Conexão WebSocket fechada.');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  // Function to send WebSocket message with dynamic keys
  const sendWebSocketMessage = (method: string) => {
    if (!ws || !keys) return;

    const payload = {
      method: method,
      keys: keys.split(',').map(key => key.trim())  // Split multiple keys by comma and trim
    };

    // Send WebSocket message
    ws.send(JSON.stringify(payload));
    setMessage(`Sent: ${JSON.stringify(payload)}`);

    // Send HTTP request to backend with the same payload
    sendHttpPayload(payload);
  };

  // Function to send the same payload to the backend via HTTP
  const sendHttpPayload = async (payload: { method: string, keys: string[] }) => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Backend response:', data);
    } catch (error) {
      console.error('Erro ao enviar dados ao backend:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>WebSocket Subscription</h1>

      {/* Input for keys */}
      <div>
        <label>
          Enter Keys (comma-separated):
          <input
            type="text"
            value={keys}
            onChange={(e) => setKeys(e.target.value)}
            placeholder="e.g., key1, key2"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      {/* Method Buttons */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => { sendWebSocketMessage('subscribeNewToken'); setMethod('subscribeNewToken'); }}>
          Subscribe New Token
        </button>
        <button onClick={() => { sendWebSocketMessage('subscribeTokenTrade'); setMethod('subscribeTokenTrade'); }}>
          Subscribe Token Trade
        </button>
        <button onClick={() => { sendWebSocketMessage('subscribeAccountTrade'); setMethod('subscribeAccountTrade'); }}>
          Subscribe Account Trade
        </button>
        <button onClick={() => { sendWebSocketMessage('unsubscribeNewToken'); setMethod('unsubscribeNewToken'); }}>
          Unsubscribe New Token
        </button>
        <button onClick={() => { sendWebSocketMessage('unsubscribeTokenTrade'); setMethod('unsubscribeTokenTrade'); }}>
          Unsubscribe Token Trade
        </button>
        <button onClick={() => { sendWebSocketMessage('unsubscribeAccountTrade'); setMethod('unsubscribeAccountTrade'); }}>
          Unsubscribe Account Trade
        </button>
      </div>

      {/* Display Sent Message */}
      {message && <div><strong>Message Sent:</strong> {message}</div>}

      {/* Real-time response display */}
      <div style={{ marginTop: '20px' }}>
        <h3>Real-time Data:</h3>
        <pre style={{ backgroundColor: 'red', padding: '10px' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default WebSocketComponent;
