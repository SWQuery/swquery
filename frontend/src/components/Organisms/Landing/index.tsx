import { Footer } from "@/components/Molecules/Landing/Footer";
import { Intro } from "@/components/Molecules/Landing/Intro";
import { Section } from "@/components/Molecules/Landing/Section";
import { Navbar } from "@/components/Molecules/Navbar";
import {
	ChevronRight,
	Globe,
	Brain,
	PieChart,
	ShieldCheck,
} from "lucide-react";

export const Landing = () => {
	const itemsHowItWorks = [
		{
			Icon: ChevronRight,
			iconColor: "#14F195",
			title: "Connect Your Wallet",
			description:
				"Use your Solana wallet to integrate with the SWquery system.",
		},
		{
			Icon: ChevronRight,
			iconColor: "#9945FF",
			title: "Select Data",
			description:
				"Choose the transactions you want to query and filter.",
		},
		{
			Icon: ChevronRight,
			iconColor: "#00D1FF",
			title: "Visualize Results",
			description:
				"Access intuitive visualizations and personalized reports.",
		},
	];

	const itemsFeatures = [
		{
			Icon: Brain,
			iconColor: "#14F195",
			title: "Advanced AI",
			description:
				"Intelligent solutions for automated analysis of complex data.",
			className: "hover:scale-105 transition-transform",
		},
		{
			Icon: PieChart,
			iconColor: "#9945FF",
			title: "Intuitive Visualizations",
			description: "Clear charts and reports for instant interpretation.",
			className: "hover:scale-105 transition-transform",
		},
		{
			Icon: Globe,
			iconColor: "#00D1FF",
			title: "Global Connection",
			description:
				"Seamless integration with the Solana network anywhere in the world.",
			className: "hover:scale-105 transition-transform",
		},
	];

	const itemsTechnicalBenefits = [
		{
			Icon: ShieldCheck,
			iconColor: "#14F195",
			title: "Cutting-Edge Security",
			description:
				"We ensure the security of your data with advanced encryption and blockchain security standards.",
		},
		{
			Icon: PieChart,
			iconColor: "#9945FF",
			title: "Scalability",
			description:
				"Our solution is optimized to handle large volumes of transactions without performance loss.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#101010] text-white">
			<Navbar />
			<Intro />
			<Section
				title="How It Works"
				items={itemsHowItWorks}
				columns={3}
				textAlign="center"
			/>
			<Section
				title="Features"
				items={itemsFeatures}
				columns={3}
				textAlign="center"
			/>
			<Section
				title="Technical Benefits"
				items={itemsTechnicalBenefits}
				columns={2}
				textAlign="left"
			/>
			<Footer />
		</div>
	);
};
