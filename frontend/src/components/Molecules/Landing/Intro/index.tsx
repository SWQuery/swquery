"use client";

import { CodeExample } from "@/components/Atoms/CodeExample";
import { Explanation } from "./Explanation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const Intro: React.FC = () => {
	return (
		<main className="container mx-auto px-4 py-16 space-y-24">
			<div className="grid md:grid-cols-2 gap-8 items-center">
				<div className="space-y-6">
					<Explanation />
				</div>
				<div className="w-full">
					<CodeExample
						code={`use swquery::SWqueryClient;

fn main() {
    let client = SWqueryClient::new();

    // Define your natural language query
    let query = "Show all transactions over 10 SOL in the past week";

    // Execute the query
    match client.query_wallet("YourWalletAddressHere", query) {
        Ok(response) => println!("Query Result: {:?}", response),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}`}
					/>
				</div>
			</div>

			<div className="flex md:flex-col flex-col-reverse md:grid gap-4 md:gap-8 items-center px-4 md:px-6">
				{/* <motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="w-full min-h-[450px] md:h-[500px] rounded-lg overflow-hidden shadow-lg"
				> */}
					{/* <Card className="border-none h-full">
						<CardContent className="p-0 h-full">
							<iframe
								className="w-full h-full min-h-[450px] md:h-full"
								id="geckoterminal-embed"
								title="GeckoTerminal Embed"
								src="https://www.geckoterminal.com/solana/pools/EF2yDS1gGHJBQD6syNGdd7uPc7fJpKwEifSrzhzMbND7?embed=1&info=0&swaps=0&grayscale=0&light_chart=0"
								frameBorder="0"
								allow="clipboard-write"
								allowFullScreen
							></iframe>
						</CardContent>
					</Card> */}
				{/* </motion.div> */}

				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="w-full space-y-4 md:space-y-6"
				>
					<Card
						className="bg-[#181818] p-4 md:p-6 lg:p-8 rounded-2xl border border-[#3b3b3b] shadow-md
                      shadow-[#8F00FF33] hover:shadow-[#E156FF55] transition-all duration-500 ease-in-out text-white"
					>
						<CardContent className="p-4 md:p-6 space-y-3 md:space-y-4 flex gap-3 md:gap-4">
							<div>
								<h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">
									Join Our Alpha Version 🚀
								</h3>
								<p className="text-base md:text-lg leading-relaxed">
									Holders of at least{" "}
									<b>20,000 $SWQUERY 🔮</b> can access and
									start using our platform.
								</p>
							</div>
							<Link
								href="https://jup.ag/swap/SOL-EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump"
								target="_blank"
								className="inline-block"
							>
								<Badge
									variant="secondary"
									className="text-sm md:text-md px-2 md:px-3 py-1 gap-1 md:gap-2 bg-gradient-to-br from-[#9000ff] to-[#e056ff] text-white break-all"
								>
									<span className="hidden md:inline">
										EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump
									</span>
									<span className="md:hidden">
										{`${`EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump`.slice(
											0,
											12
										)}...${`EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump`.slice(
											-8
										)}`}
									</span>
									<ExternalLink
										size={14}
										className="flex-shrink-0"
									/>
								</Badge>
							</Link>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</main>
	);
};
