"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Atoms/Buttons/button";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="relative flex flex-col h-screen overflow-hidden">
			<motion.div
				className="absolute inset-0 z-0"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				style={{
					background:
						"linear-gradient(135deg, #0b0b0b, #1a1a1a, #000000)",
					backgroundSize: "400% 400%",
				}}
				transition={{ duration: 2 }}
			/>
			<motion.div
				className="pointer-events-none absolute inset-0 z-0"
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.1 }}
				style={{
					background:
						"linear-gradient(to right, transparent, #9C88FF15, transparent)",
				}}
			>
				<motion.div
					className="absolute inset-y-0 w-1 bg-[#9C88FF50]"
					initial={{ x: "-100%" }}
					animate={{ x: "100%" }}
					transition={{
						duration: 5,
						repeat: Infinity,
						repeatType: "reverse",
						ease: "easeInOut",
					}}
				/>
			</motion.div>
			<div className="relative z-10 flex flex-col h-screen bg-black/70 backdrop-blur-md">
				<div className="flex-1 flex items-center justify-center p-6">
					<AnimatePresence>
						<motion.div
							key="coming-soon-content"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5 }}
							className="max-w-2xl w-full space-y-8 text-center"
						>
							<div className="space-y-2">
								<div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#9C88FF]/10 to-[#6C5CE7]/10 flex items-center justify-center mx-auto mb-4">
									<div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="w-8 h-8 text-white"
										>
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
									</div>
								</div>
								<h1
									className="text-4xl font-bold text-gray-200 relative inline-block"
									style={{
										background:
											"linear-gradient(to right, #9C88FF, #6C5CE7, #9C88FF)",
										backgroundSize: "200% auto",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										animation: "shimmer 3s linear infinite",
									}}
								>
									Coming Soon
								</h1>
								<p className="text-xl text-gray-400 mt-4">
									We are working on something exciting. Stay
									tuned!
								</p>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5, duration: 0.5 }}
									className="mt-8"
								>
									<Button
										onClick={() => router.back()}
										variant="outline"
										className="bg-transparent border-[#9C88FF] text-[#9C88FF] hover:bg-[#9C88FF] hover:text-white transition-colors duration-300"
									>
										<ArrowLeft className="mr-2 h-4 w-4" />
										Go Back
									</Button>
								</motion.div>
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
			<style jsx>{`
				@keyframes shimmer {
					0% {
						background-position: 0% center;
					}
					50% {
						background-position: 100% center;
					}
					100% {
						background-position: 0% center;
					}
				}
			`}</style>
		</div>
	);
}
