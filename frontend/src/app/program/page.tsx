import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { buyCredits } from '../../services/program';

const BuyCreditsButton: React.FC = () => {
    const wallet = useWallet(); // Access wallet context
    const connection = new Connection('https://api.devnet.solana.com'); // Use correct cluster URL

    const handleBuyCredits = async () => {
        try {
            const amountUSDC = 100; // Example: 100 USDC

            await buyCredits(connection, wallet, amountUSDC);
            alert("Credits purchased successfully!");
        } catch (error) {
            console.error("Error buying credits:", error);
            alert("Failed to buy credits. Please try again.");
        }
    };

    return (
        <button
            onClick={handleBuyCredits}
            disabled={!wallet.connected}
            style={{
                padding: "10px 20px",
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
            }}
        >
            Buy Credits
        </button>
    );
};

export default BuyCreditsButton;
