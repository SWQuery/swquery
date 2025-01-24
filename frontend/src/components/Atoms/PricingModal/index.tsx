import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import axios from "axios";
import { Card, CardContent } from "@/components/Atoms/CardComponent";
import { USDC_MINT, SWQUERY_WALLET, API_URL } from "@/utils/constants";

interface Package {
  id: string;
  name: string;
  price_usdc: number;
  features: string[];
}

interface PurchaseResult {
  message: string;
  remaining_requests: number;
  package_requests: number;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${API_URL}/packages`)
        .then((response) => setPackages(response.data))
        .catch((error) => console.error("Failed to fetch packages:", error));
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!selectedPackage || !publicKey) return;
    try {
      setLoading(true);
      setError(null);

      const senderAta = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        publicKey!
      );
      const recipientAta = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        new PublicKey(SWQUERY_WALLET)
      );

      const transferInstruction = createTransferInstruction(
        senderAta,
        recipientAta,
        publicKey!,
        BigInt(selectedPackage.price_usdc * 1_000_000) // Convert to USDC decimals
      );

      const transaction = new Transaction().add(transferInstruction);
      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(signature);

      const { data } = await axios.post<PurchaseResult>(
        `${API_URL}/packages/verify`,
        {
          package_id: selectedPackage.id,
          signature,
          user_pubkey: publicKey.toString(),
        }
      );

      setPurchaseResult(data);
    } catch (err: any) {
      setError(err.response?.data || err.message);
      console.error("Purchase failed:", err);
    } finally {
      setLoading(false);
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
            {/* Modal Title */}
            <h2 className="text-3xl font-semibold text-white text-center mb-0">
              Oops, your free trial credits have ended!
            </h2>
            <p className="text-lg text-gray-300 text-center mt-0">
              But don’t worry, we’ve got you covered with the best plans to keep
              you querying seamlessly.
            </p>

            {/* Call to Action */}
            <h3 className="text-2xl font-semibold text-purple-500 text-center">
              Choose the plan that fits your needs!
            </h3>
            <p className="text-gray-300 text-center">
              From casual users to power developers, we have options designed
              just for you.
            </p>

            {/* Pricing Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`flex flex-col bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-xl p-6 border ${
                    selectedPackage?.id === pkg.id
                      ? "border-blue-500"
                      : "border-gray-700"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {/* Plan Header */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-3xl font-bold text-purple-500 mb-4">
                    {pkg.price_usdc} USDC
                  </p>

                  {/* Features List */}
                  <ul className="text-gray-300 space-y-2 pb-4">
                    {pkg.features.map((feature, i) => (
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
                </div>
              ))}
            </div>

            {/* Purchase Button */}
            <div className="mt-4 text-center">
              <button
                onClick={handlePurchase}
                disabled={loading || !publicKey || !selectedPackage}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : selectedPackage
                  ? `Purchase ${selectedPackage.name}`
                  : "Select a Package"}
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {/* Success Message */}
            {purchaseResult && (
              <div className="mt-4 p-4 bg-green-100 rounded">
                <h3 className="font-bold">Purchase Successful!</h3>
                <p>{purchaseResult.message}</p>
                <p>Remaining Credits: {purchaseResult.remaining_requests}</p>
                <p>Added Credits: {purchaseResult.package_requests}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingModal;
