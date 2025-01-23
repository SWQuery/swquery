# SWQuery Frontend Integration Guide

This guide demonstrates how to integrate the SWQuery package verification system with a Next.js frontend using the Solana wallet adapter.

## Prerequisites

-   Next.js 13+
-   @solana/web3.js
-   @solana/wallet-adapter-react
-   @solana/wallet-adapter-wallets
-   @solana/spl-token

## Setup

First, create the necessary components and utilities:

```ts
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SWQUERY_WALLET = "BXVjUeXZ5GgbPvqCsUXdGz2G7zsg436GctEC3HkNLABK";
export const API_URL = "http://localhost:5500";
```

```tsx
import { useState } from "react";
import { Package } from "../types";

export function PackageSelector({ packages, onSelect }) {
	const [selected, setSelected] = useState<Package | null>(null);

	return (
		<div className="grid grid-cols-3 gap-4">
			{packages.map((pkg) => (
				<div
					key={pkg.id}
					className={`p-4 border rounded-lg cursor-pointer ${
						selected?.id === pkg.id
							? "border-blue-500"
							: "border-gray-200"
					}`}
					onClick={() => {
						setSelected(pkg);
						onSelect(pkg);
					}}
				>
					<h3 className="text-lg font-bold">{pkg.name}</h3>
					<p className="text-gray-600">
						{pkg.requests_amount} Requests
					</p>
					<p className="text-lg font-bold">{pkg.price_usdc} USDC</p>
				</div>
			))}
		</div>
	);
}
```

```tsx
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
	createTransferInstruction,
	getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { USDC_MINT, SWQUERY_WALLET } from "../utils/constants";

export function PackagePurchase({ selectedPackage, onSuccess }) {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePurchase = async () => {
		try {
			setLoading(true);
			setError(null);

			// Get token accounts
			const senderAta = await getAssociatedTokenAddress(
				new PublicKey(USDC_MINT),
				publicKey!
			);
			const recipientAta = await getAssociatedTokenAddress(
				new PublicKey(USDC_MINT),
				new PublicKey(SWQUERY_WALLET)
			);

			// Create transfer instruction
			const transferInstruction = createTransferInstruction(
				senderAta,
				recipientAta,
				publicKey!,
				BigInt(selectedPackage.price_usdc * 1_000_000) // Convert to USDC decimals
			);

			// Create and send transaction
			const transaction = new Transaction().add(transferInstruction);
			const signature = await sendTransaction(transaction, connection);

			// Wait for confirmation
			await connection.confirmTransaction(signature);

			// Verify with backend
			const { data } = await axios.post(`${API_URL}/packages/verify`, {
				package_id: selectedPackage.id,
				signature,
				user_pubkey: publicKey!.toString(),
			});

			onSuccess(data);
		} catch (err) {
			setError(err.response?.data || err.message);
			console.error("Purchase failed:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mt-4">
			<button
				onClick={handlePurchase}
				disabled={loading || !publicKey}
				className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
			>
				{loading ? "Processing..." : "Purchase Package"}
			</button>
			{error && <p className="text-red-500 mt-2">{error}</p>}
		</div>
	);
}
```

## Usage

In your page component:

```tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { PackageSelector } from "../components/PackageSelector";
import { PackagePurchase } from "../components/PackagePurchase";
import { API_URL } from "../utils/constants";

export default function PackagesPage() {
	const [packages, setPackages] = useState([]);
	const [selected, setSelected] = useState(null);
	const [purchaseResult, setPurchaseResult] = useState(null);

	useEffect(() => {
		axios
			.get(`${API_URL}/packages`)
			.then((response) => setPackages(response.data))
			.catch((error) =>
				console.error("Failed to fetch packages:", error)
			);
	}, []);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Purchase Credits</h1>

			<PackageSelector packages={packages} onSelect={setSelected} />

			{selected && (
				<PackagePurchase
					selectedPackage={selected}
					onSuccess={setPurchaseResult}
				/>
			)}

			{purchaseResult && (
				<div className="mt-4 p-4 bg-green-100 rounded">
					<h3 className="font-bold">Purchase Successful!</h3>
					<p>{purchaseResult.message}</p>
					<p>
						Remaining Credits: {purchaseResult.remaining_requests}
					</p>
					<p>Added Credits: {purchaseResult.package_requests}</p>
				</div>
			)}
		</div>
	);
}
```

## Flow Explanation

1. User connects their wallet
2. Selects a package from the available options
3. Clicks purchase, which:
    - Creates a USDC transfer transaction
    - Sends it to the Solana network
    - Waits for confirmation
    - Sends signature to backend for verification
    - Displays updated credit balance
4. Shows success message with updated credits

## Error Handling

The integration handles various error cases:

-   Wallet not connected
-   Insufficient USDC balance
-   Transaction failure
-   Backend verification issues

## Testing

Use the test signature from `test.sh` (lines 67-69) for development testing:

```typescript
const testSignature =
	"3dMe8itJ7Rbc3E42aFMDWyrJJPv4dHUpXgoqWFKhHNKB4mbd2veFp8LMEdfzEAoYS9XbXTTQSpQszwSpmY33q9Ky";
```
