/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/Atoms/CardComponent";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { API_URL } from "@/utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
	createTransferCheckedInstruction,
	getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
	PublicKey,
	Transaction,
	SystemProgram,
	LAMPORTS_PER_SOL,
	sendAndConfirmTransaction,
} from "@solana/web3.js";

// const connection = new Connection("https://api.mainnet-beta.solana.com");

interface PricingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onPurchaseSuccess?: () => void;
}

interface Package {
	id: number;
	name: string;
	price_usdc: number;
	requests_amount: number;
}

// Add interface for the verify response
interface VerifyResponse {
	message: string;
	remaining_requests: number;
	package_requests: number;
}

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const RECIPIENT_WALLET = new PublicKey(
	"BXVjUeXZ5GgbPvqCsUXdGz2G7zsg436GctEC3HkNLABK" // SWQuery
);

const PricingModal = ({
	isOpen,
	onClose,
	onPurchaseSuccess,
}: PricingModalProps) => {
	const [packages, setPackages] = useState<Package[]>([]);
	const [loading, setLoading] = useState(true);
	const [verifying, setVerifying] = useState(false);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string>("");
	const [alertSeverity, setAlertSeverity] = useState<
		"success" | "error" | "warning" | "info"
	>("info");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
	const [purchaseSuccess, setPurchaseSuccess] = useState<{
		message: string;
		remaining_requests: number;
		package_requests: number;
	} | null>(null);
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();

	useEffect(() => {
		const fetchPackages = async () => {
			try {
				const response = await axios.get(`${API_URL}/packages`);
				setPackages(response.data);
			} catch (error: any) {
				setAlertMessage("Failed to fetch packages");
				setAlertSeverity("error");
				setAlertOpen(true);
			} finally {
				setLoading(false);
			}
		};

		if (isOpen) {
			fetchPackages();
		}
	}, [isOpen]);

	const handlePlanSelection = (plan: Package) => {
		setSelectedPlan(plan);
		setConfirmOpen(true);
	};

	const handleConfirmTransaction = async () => {
		if (!selectedPlan || !publicKey) return;

		setVerifying(true);
		try {
			// Get token accounts
			const userUsdcAccount = getAssociatedTokenAddressSync(
				USDC_MINT,
				publicKey
			);
			const recipientUsdcAccount = getAssociatedTokenAddressSync(
				USDC_MINT,
				RECIPIENT_WALLET
			);

			// Create transfer instruction
			const transferInstruction = createTransferCheckedInstruction(
				userUsdcAccount,
				USDC_MINT,
				recipientUsdcAccount,
				publicKey,
				BigInt(selectedPlan.price_usdc * 1_000_000),
				6
			);

			// Create and send transaction
			const transaction = new Transaction().add(transferInstruction);
			const { blockhash } = await connection.getLatestBlockhash();
			transaction.recentBlockhash = blockhash;
			transaction.feePayer = publicKey;

			const signature = await sendTransaction(transaction, connection);
			await connection.confirmTransaction(signature);

			// Verify with backend
			const response = await axios.post(`${API_URL}/packages/verify`, {
				package_id: selectedPlan.id,
				signature,
				user_pubkey: publicKey.toString(),
			});

			setPurchaseSuccess(response.data);
			setAlertMessage("Purchase successful!");
			setAlertSeverity("success");

			// Call the callback after successful purchase
			onPurchaseSuccess?.();
		} catch (err: any) {
			setAlertMessage(err.message || "Transaction failed");
			setAlertSeverity("error");
			setPurchaseSuccess(null);
		} finally {
			setVerifying(false);
			setAlertOpen(true);
		}
	};

	const handleCloseAll = () => {
		setConfirmOpen(false);
		onClose();
		setPurchaseSuccess(null);
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
							But don&apos;t worry, we&apos;ve got you covered
							with the best plans to keep you querying seamlessly.
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{loading ? (
								<div>Loading packages...</div>
							) : (
								packages.map((pkg) => (
									<div
										key={pkg.id}
										className="flex flex-col bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-xl p-6 border border-gray-700"
									>
										<h3 className="text-xl font-semibold text-white mb-2">
											{pkg.name}
										</h3>
										<p className="text-3xl font-bold text-purple-500 mb-4">
											${pkg.price_usdc}
										</p>
										<ul className="text-gray-300 space-y-2 pb-4">
											<li className="flex items-center">
												<Check
													size={20}
													className="text-purple-500 mr-2"
													strokeWidth={2}
												/>
												{pkg.requests_amount} requests
											</li>
											<li className="flex items-center">
												<Check
													size={20}
													className="text-purple-500 mr-2"
													strokeWidth={2}
												/>
												Priority Support
											</li>
										</ul>
										<button
											className="mt-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white hover:opacity-90 transition-colors"
											onClick={() =>
												handlePlanSelection(pkg)
											}
										>
											Get {pkg.name}
										</button>
									</div>
								))
							)}
						</div>
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
			<Modal
				open={confirmOpen}
				onClose={() => !verifying && setConfirmOpen(false)}
			>
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
					{purchaseSuccess ? (
						<>
							<Typography
								variant="h6"
								component="h2"
								gutterBottom
							>
								Purchase Successful!
							</Typography>
							<Typography sx={{ mb: 2 }}>
								{purchaseSuccess.message}
							</Typography>
							<Typography sx={{ mb: 2 }}>
								Remaining Credits:{" "}
								{purchaseSuccess.remaining_requests}
							</Typography>
							<Typography sx={{ mb: 4 }}>
								Added Credits:{" "}
								{purchaseSuccess.package_requests}
							</Typography>
							<Button
								onClick={handleCloseAll}
								variant="contained"
								color="primary"
								fullWidth
							>
								Close
							</Button>
						</>
					) : (
						<>
							<Typography
								variant="h6"
								component="h2"
								gutterBottom
							>
								Confirm Purchase
							</Typography>
							<Typography sx={{ mb: 2 }}>
								Are you sure you want to purchase the{" "}
								{selectedPlan?.name} for $
								{selectedPlan?.price_usdc}?
							</Typography>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
								}}
							>
								<Button
									onClick={() => setConfirmOpen(false)}
									variant="outlined"
									color="primary"
									disabled={verifying}
								>
									Cancel
								</Button>
								<Button
									onClick={handleConfirmTransaction}
									variant="contained"
									color="secondary"
									disabled={verifying}
								>
									{verifying ? (
										<div className="flex items-center">
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Verifying...
										</div>
									) : (
										"Confirm"
									)}
								</Button>
							</div>
						</>
					)}
				</Box>
			</Modal>
		</div>
	);
};

export default PricingModal;
