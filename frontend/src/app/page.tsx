"use client";

import { Landing } from "@/components/Organisms/Landing";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";

export default function Home() {
	return (
		<SolanaWalletProvider>
			<Landing />
		</SolanaWalletProvider>
	);
}
