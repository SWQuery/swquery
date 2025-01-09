import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SolanaWalletProvider from "@/providers/SolanaWalletProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SWQuery",
	description: "SWQuery is a Solana-based data query system.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SolanaWalletProvider>
					{children}
				</SolanaWalletProvider>
				<Toaster
					position="top-center"
					reverseOrder={false}
				/>
			</body>
		</html>
	);
}
