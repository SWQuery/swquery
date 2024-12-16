"use client"

import React, { FC, useMemo } from "react";
import {
	ConnectionProvider,
	WalletProvider,
	useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolanaAuthProvider } from "solana-react-auth";

interface WalletProps {
	children: React.ReactNode;
}

export const SolanaWalletProvider: FC<WalletProps> = ({ children }) => {
	const network = WalletAdapterNetwork.Devnet;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);

	const wallets = useMemo(
		() => [
			// new UnsafeBurnerWalletAdapter()
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[network]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					<AuthProviderWrapper>{children}</AuthProviderWrapper>
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

const AuthProviderWrapper: FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const walletContext = useWallet();

	return (
		<SolanaAuthProvider
			wallet={walletContext}
			message={"Sign in into your wallet"}
			authTimeout={60}
		> 
			{children}
		</SolanaAuthProvider>
	);
};
