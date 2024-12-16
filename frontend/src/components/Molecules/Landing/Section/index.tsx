import React from "react";
import { motion } from "framer-motion";
import { CardItem } from "@/components/Atoms/SectionItem";
import { TypeIcon as type, LucideIcon } from "lucide-react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
	title: string;
	items?: {
		Icon: LucideIcon;
		iconColor: string;
		title: string;
		description: string;
		className?: string;
	}[];
	columns?: number;
	textAlign?: string;
}

export const Section: React.FC<SectionProps> = ({
	title,
	items = [],
	columns = 3,
	textAlign = "center",
	className = "",
	...props
}) => {
	const columnsClass = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
	const textAlignClass = textAlign === "left" ? "text-left" : "text-center";

	return (
		<section
			className={`container mx-auto px-6 pt-20 pb-16 ${textAlignClass} ${className}`}
			{...props}
		>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative mb-16"
			>
				<h3 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-white">
					{title}
				</h3>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ staggerChildren: 0.2 }}
				className={`grid ${columnsClass} gap-32`}
			>
				{items.map((item, index) => (
					<CardItem
						key={index}
						Icon={item.Icon}
						iconColor={item.iconColor}
						title={item.title}
						description={item.description}
						className={item.className}
					/>
				))}
			</motion.div>
		</section>
	);
};
