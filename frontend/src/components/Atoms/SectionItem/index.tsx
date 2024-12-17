import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CardItemProps extends React.HTMLAttributes<HTMLDivElement> {
	iconColor: string;
	title: string;
	description: string;
	Icon: LucideIcon;
}

export const CardItem: React.FC<CardItemProps> = ({
	Icon,
	iconColor,
	title,
	description,
	className = "",
	// ...props
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={`group relative p-[1px] rounded-xl bg-[#101010] transition-all duration-300 bg-gradient-to-r from-[#14F195] via-[#9945FF] to-[#00D1FF] ${className}`}
		>
			{/* Gradient shadow effect */}
			<div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#14F195] via-[#9945FF] to-[#00D1FF]" />

			{/* Card content */}
			<div className="relative h-full bg-[#101010] rounded-xl p-6">
				<div className="flex flex-col h-full">
					<div className="mb-6">
						<Icon
							size={32}
							className="transition-transform duration-300 group-hover:scale-110 mx-auto"
							style={{ color: iconColor }}
						/>
						<h4 className="text-xl font-bold mt-8 bg-clip-text text-transparent bg-white opacity-80 group-hover:opacity-100">
							{title}
						</h4>
					</div>
					<p className="text-gray-400 mt-2 mb-16 group-hover:text-white transition-colors duration-300">
						{description}
					</p>
				</div>
			</div>
		</motion.div>
	);
};
