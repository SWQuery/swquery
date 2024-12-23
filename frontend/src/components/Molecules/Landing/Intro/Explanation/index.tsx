"use client";
import { motion } from "framer-motion";
import { Database, Layers, ZoomIn } from "lucide-react";
import Link from "next/link";

export const Explanation = () => {
	return (
		<motion.div
			initial={{ opacity: 0, x: -50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8 }}
			className="w-full"
		>
			<h2 className="text-4xl md:text-6xl font-bold mb-6 pb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#9C88FF] via-[#6C5CE7] to-[#2D88E6]">
				Query transactions in your wallet with natural language
			</h2>
			<p className="text-base md:text-lg mb-8 text-gray-300 leading-relaxed">
				Utilize the power of Solana blockchain technology to easily and
				quickly query and visualize transactions using the intelligence
				of our platform.
			</p>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="space-y-4"
			>
				<div className="flex items-center space-x-4">
					<div className="bg-gradient-to-r from-[#6C5CE7] to-[#2D88E6] p-2 rounded-full shadow-md">
						<Database className="text-black" size={24} />
					</div>
					<span className="text-base md:text-lg">
						Simplified Data Extraction
					</span>
				</div>
				<div className="flex items-center space-x-4">
					<div className="bg-gradient-to-r from-[#6C5CE7] to-[#2D88E6] p-2 rounded-full shadow-md">
						<Layers className="text-black" size={24} />
					</div>
					<span className="text-base md:text-lg">
						Intelligent Data Transformation
					</span>
				</div>
				<div className="flex items-center space-x-4">
					<div className="bg-gradient-to-r from-[#6C5CE7] to-[#2D88E6] p-2 rounded-full shadow-md">
						<ZoomIn className="text-black" size={24} />
					</div>
					<span className="text-base md:text-lg">
						Comprehensive Data Visualization
					</span>
				</div>
			</motion.div>
			<div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
				<motion.button
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.3 }}
					className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] px-6 py-3 rounded-full hover:opacity-80 transition-all shadow-lg w-full sm:w-auto"
				>
					<Link href={"/chatbot"} target="_blank">
						Explore Platform
					</Link>
				</motion.button>

				<motion.button
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.4 }}
					className="border border-[#9C88FF] px-6 py-3 rounded-full hover:bg-[#9C88FF] hover:text-black transition-all shadow-lg w-full sm:w-auto"
				>
					<Link href={"https://bretasarthur1.gitbook.io/swquery/"} target="_blank">
					Learn More
					</Link>
				</motion.button>
			</div>
		</motion.div>
	);
};
