import { Footer } from "@/components/Molecules/Landing/Footer";
import { Intro } from "@/components/Molecules/Landing/Intro";
import { Section } from "@/components/Molecules/Landing/Section";
import { Navbar } from "@/components/Molecules/Navbar";
import { FeatureSection } from "@/components/Atoms/FeatureSection";
import { Wallet, Filter, BarChart } from 'lucide-react';

export const Landing = () => {
	const itemsHowItWorks = [
		{
			Icon: Wallet,
			iconColor: "#9945FF",
			title: "Connect Your Wallet",
			description:
				"Use your Solana wallet to integrate with the SWquery system.",
		},
		{
			Icon: Filter,
			iconColor: "#9945FF",
			title: "Select Data",
			description:
				"Choose the transactions you want to query and filter.",
		},
		{
			Icon: BarChart,
			iconColor: "#9945FF",
			title: "Visualize Results",
			description:
				"Access intuitive visualizations and personalized reports.",
		},
	];

	// const itemsFeatures = [
	// 	{
	// 		Icon: Brain,
	// 		iconColor: "#14F195",
	// 		title: "Advanced AI",
	// 		description:
	// 			"Intelligent solutions for automated analysis of complex data.",
	// 		className: "hover:scale-105 transition-transform",
	// 	},
	// 	{
	// 		Icon: PieChart,
	// 		iconColor: "#9945FF",
	// 		title: "Intuitive Visualizations",
	// 		description: "Clear charts and reports for instant interpretation.",
	// 		className: "hover:scale-105 transition-transform",
	// 	},
	// 	{
	// 		Icon: Globe,
	// 		iconColor: "#00D1FF",
	// 		title: "Global Connection",
	// 		description:
	// 			"Seamless integration with the Solana network anywhere in the world.",
	// 		className: "hover:scale-105 transition-transform",
	// 	},
	// ];

	// const itemsTechnicalBenefits = [
	// 	{
	// 		Icon: ShieldCheck,
	// 		iconColor: "#14F195",
	// 		title: "Cutting-Edge Security",
	// 		description:
	// 			"We ensure the security of your data with advanced encryption and blockchain security standards.",
	// 	},
	// 	{
	// 		Icon: PieChart,
	// 		iconColor: "#9945FF",
	// 		title: "Scalability",
	// 		description:
	// 			"Our solution is optimized to handle large volumes of transactions without performance loss.",
	// 	},
	// ];

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#101010] text-white">
			<Navbar />
			<div className="pt-40">
				<Intro />
				<Section
					title="How It Works"
					items={itemsHowItWorks}
					columns={3}
					textAlign="center"
				/>
				<FeatureSection
					title="If It Requires Bridging, It's Not"
					subtitle="Solana-Native."
					description="SWquery is a bridgeless query platform that brings programmability directly to the Solana base layer, unlike L2s and metaprotocols that silo liquidity to side chains and require added trust in their bridging process."
					buttonText="Learn more"
					buttonLink="#learn-more"
					codeSnippet={`
// Example SWquery code
const query = new SWquery();
const result = await query
  .filter('transaction.type', 'transfer')
  .execute();
console.log(result);
					`}
				/>
				<FeatureSection
					title="The World's Fastest"
					subtitle="Blockchain, Unlocked."
					description="SWquery powers the first generation of decentralized applications capable of accessing the full liquidity of the Solana blockchain, enabling new use cases from DeFi to DAOs."
					buttonText="Start Building"
					buttonLink="#start-building"
					codeSnippet={`
// Another SWquery example
const analytics = new SWqueryAnalytics();
const tvl = await analytics
  .calculateTVL('your-project-address');
console.log(\`Total Value Locked: $\${tvl}\`);
					`}
					reversed
				/>
				<Footer />
			</div>
		</div>
	);
};

