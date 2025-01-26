"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/Atoms/CardComponent";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const connection = new Connection("https://api.mainnet-beta.solana.com");

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const pricingOptions = [
  {
    title: "Basic Plan",
    price: "$10",
    lamports: 10 * LAMPORTS_PER_SOL,
    features: ["25 requests", "Access to basic insights", "Email support"],
    buttonText: "Get Basic Plan",
  },
  {
    title: "Standard Plan",
    price: "$30",
    lamports: 30 * LAMPORTS_PER_SOL,
    features: [
      "80 requests",
      "Advanced on-chain analytics",
      "Real-time notifications",
    ],
    buttonText: "Get Standard Plan",
  },
  {
    title: "Pro Plan",
    price: "$50",
    lamports: 50 * LAMPORTS_PER_SOL,
    features: [
      "150 requests",
      "Priority on-chain analytics",
      "Priority support",
    ],
    buttonText: "Get Pro Plan",
  },
  {
    title: "Enterprise Plan",
    price: "Contact Us",
    lamports: 0,
    features: [
      "Custom request limits",
      "Tailored solutions for businesses",
      "Dedicated account manager",
      "Premium support",
    ],
    buttonText: "Contact Us",
  },
];

const getProvider = () => {
  if ("solana" in window) {
    const provider = (window as any).solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    null | (typeof pricingOptions)[0]
  >(null);

  const buyCredits = async (amount: number) => {
    const provider = getProvider();
    if (!provider) {
      setAlertMessage("Phantom wallet not found. Please install it.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    try {
      const fromPubkey = provider.publicKey;
      const toPubkey = new PublicKey(
        "BXVjUeXZ5GgbPvqCsUXdGz2G7zsg436GctEC3HkNLABK"
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const signedTransaction = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(signature);

      setAlertMessage("Transaction successful! Signature: " + signature);
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (err: any) {
      setAlertMessage("Transaction failed: " + err.message);
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const handlePlanSelection = (plan: (typeof pricingOptions)[0]) => {
    setSelectedPlan(plan);
    setConfirmOpen(true);
  };

  const handleConfirmTransaction = () => {
    setConfirmOpen(false);
    if (selectedPlan) {
      if (selectedPlan.lamports > 0) {
        buyCredits(selectedPlan.lamports);
      } else {
        setAlertMessage("Please contact us for Enterprise Plan pricing.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full mx-4 md:mx-0 md:w-4/5 max-w-7xl">
        <Card className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <CardContent className="space-y-8">
            <h2 className="text-3xl font-semibold text-white text-center mb-0">
              Oops, your free trial credits have ended!
            </h2>
            <p className="text-lg text-gray-300 text-center mt-0">
              But don’t worry, we’ve got you covered with the best plans to keep
              you querying seamlessly.
            </p>
            <h3 className="text-2xl font-semibold text-purple-500 text-center">
              Choose the plan that fits your needs!
            </h3>
            <p className="text-gray-300 text-center">
              From casual users to power developers, we have options designed
              just for you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex flex-col bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-3xl font-bold text-purple-500 mb-4">
                    {option.price}
                  </p>
                  <ul className="text-gray-300 space-y-2 pb-4">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check
                          size={20}
                          className="text-purple-500 mr-2"
                          strokeWidth={2}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white hover:opacity-90 transition-colors"
                    onClick={() => handlePlanSelection(option)}
                  >
                    {option.buttonText}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-center text-sm">
              Need help deciding? Reach out to us anytime, and we’ll help you
              find the perfect plan!
            </p>
          </CardContent>
        </Card>
      </div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#2d2d2d",
            border: "2px solid #6366f1",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Confirm Purchase
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to purchase the {selectedPlan?.title} for{" "}
            {selectedPlan?.price}?
          </Typography>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransaction}
              variant="contained"
              color="secondary"
            >
              Confirm
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default PricingModal;