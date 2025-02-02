import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useState, useMemo, useEffect } from "react";

export const dynamic = "force-dynamic";

export const useTokenAccess = (tokenMintAddress: string, rpcUrl: string) => {
	const wallet = useWallet();
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const memoizedRpcUrl = useMemo(() => rpcUrl, [rpcUrl]);

	useEffect(() => {
		let mounted = true;
		setIsLoading(true);

		const checkOwnership = async () => {
			if (!wallet.publicKey) {
				setHasAccess(false);
				setIsLoading(false);
				return;
			}

			try {
				const connection = new Connection(memoizedRpcUrl, {
					commitment: "confirmed",
					confirmTransactionInitialTimeout: 60000,
				});

				const tokenMint = new PublicKey(tokenMintAddress);
				const associatedTokenAddress = await getAssociatedTokenAddress(
					tokenMint,
					wallet.publicKey
				);

				try {
					const tokenAccount = await getAccount(
						connection,
						associatedTokenAddress
					);
					if (mounted) {
						setHasAccess(tokenAccount.amount >= 20000);
						setIsLoading(false);
					}
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (err) {
					if (mounted) {
						setHasAccess(false);
						setIsLoading(false);
					}
				}
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (err) {
				if (mounted) {
					setHasAccess(false);
					setIsLoading(false);
				}
			}
		};

		checkOwnership();

		return () => {
			mounted = false;
		};
	}, [wallet.publicKey, tokenMintAddress, memoizedRpcUrl]);

	return { hasAccess, isLoading };
};
