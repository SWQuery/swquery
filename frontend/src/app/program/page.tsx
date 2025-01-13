"use client";
import React, { useState } from "react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { buyCredits } from "../../services/program";

const BuyCredits = () => {
  const [status, setStatus] = useState<string | null>(null);

  const handleBuyCredits = async () => {
    try {
      setStatus("Enviando transação...");

      const buyerKeypair = Keypair.generate();


      const buyerTokenAccount = new PublicKey(
        "9Ld2bRLUC7PrP8NSHK3WgBe3khHgtxAnjDr79YJHDxKF"
      );

      const amountUSDC = 10;

      const signature = await buyCredits(
        buyerKeypair,
        buyerTokenAccount,
        amountUSDC
      );
      setStatus(`Sucesso! Transação: ${signature}`);
    } catch (error) {
      setStatus(`Erro: ${error}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Comprar Créditos</h1>
      <button
        onClick={handleBuyCredits}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Comprar Créditos
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default BuyCredits;
