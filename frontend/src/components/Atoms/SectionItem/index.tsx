import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CardItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	iconColor: string;
	title: string;
	description: string;
	align?: string;
	className?: string;
	Icon: LucideIcon;
}

export const CardItem: React.FC<CardItemProps> = ({
	Icon,
	iconColor,
	title,
	description,
	align = "center",
	className = "",
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={`bg-[#1A1A1A] rounded-xl p-6 shadow-md ${className}`}
		>
			<Icon
				className={align == "center" ? "mx-auto" : ""}
				size={48}
				style={{ color: iconColor }}
			/>
			<h4 className="text-xl font-bold mt-4">{title}</h4>
			<p className="text-gray-400 mt-2">{description}</p>
		</motion.div>
	);
};
