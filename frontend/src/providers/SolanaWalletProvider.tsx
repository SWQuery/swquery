"use client";

import { FC, ReactNode } from "react";
import {
	ConnectionProvider,
	WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
// import { clusterApiUrl } from "@solana/web3.js";
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
	MathWalletAdapter,
	TrustWalletAdapter,
	CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
	// const network = WalletAdapterNetwork.Devnet;
	const network =
		"https://mainnet.helius-rpc.com/?api-key=c34a7f87-00f1-4691-ba9a-5daddb36588a";

	const endpoint = useMemo(
		() =>
			// clusterApiUrl(network),
			network,
		[network]
	);

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
			new MathWalletAdapter(),
			new TrustWalletAdapter(),
			new CoinbaseWalletAdapter(),
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[network]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>{children}</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default SolanaWalletProvider;
