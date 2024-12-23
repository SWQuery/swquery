import { Footer } from "@/components/Molecules/Landing/Footer";
import { Intro } from "@/components/Molecules/Landing/Intro";
import { Section } from "@/components/Molecules/Landing/Section";
import { Navbar } from "@/components/Molecules/Navbar";
import { FeatureSection } from "@/components/Atoms/FeatureSection";
import { SDKArchitectureSection  } from "@/components/Atoms/SDKArchitectureSection";
import { Wallet, Filter, BarChart } from "lucide-react";
import { CoreFeaturesSection } from "@/components/Atoms/CoreFeaturesSection";

export const Landing: React.FC = () => {
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
								<SDKArchitectureSection/>
								<CoreFeaturesSection /> {/* Nova seção adicionada aqui */}
                <FeatureSection
                    title="Query Wallet Transactions"
                    subtitle="Real-Time Data Retrieval."
                    description="Leverage the SWquery SDK to fetch and analyze wallet transactions instantly."
                    buttonText="View Documentation"
                    buttonLink="https://bretasarthur1.gitbook.io/swquery/"
                    codeSnippet={`
	use swquery::SWqueryClient;

	fn main() {
			let api_key = "your_api_key";
			let client = SWqueryClient::new(api_key);
			
			let wallet_address = "YourWalletAddressHere";
			let query = "Show all transactions over 10 SOL in the past week";

			match client.query_wallet(wallet_address, query) {
					Ok(response) => println!("Query Result: {:?}", response),
					Err(error) => eprintln!("Error: {:?}", error),
			}
	}
                    `}
                />
                <FeatureSection
                    title="Filter Data Intelligently"
                    subtitle="Powerful Query Customization."
                    description="Easily filter blockchain transactions by type, amount, or date using natural language."
                    buttonText="Try It Out"
                    buttonLink="/chatbot"
                    codeSnippet={`
	use swquery::SWqueryClient;

	fn main() {
			let api_key = "your_api_key";
			let client = SWqueryClient::new(api_key);

			let filter_query = "Find all 'transfer' transactions from last month";
			
			match client.query_wallet("YourWalletAddressHere", filter_query) {
					Ok(response) => println!("Filtered Results: {:?}", response),
					Err(error) => eprintln!("Error: {:?}", error),
			}
	}
                    `}
                    reversed
                />
                <FeatureSection
                    title="Analyze Total Value Locked"
                    subtitle="Insights for DeFi Projects."
                    description="Calculate TVL for any Solana-based project directly through the SWquery SDK."
                    buttonText="Get Started"
                    buttonLink="#get-started"
                    codeSnippet={`
	use swquery::SWqueryClient;

	fn main() {
			let api_key = "your_api_key";
			let client = SWqueryClient::new(api_key);

			let project_address = "YourProjectAddressHere";
			
			match client.calculate_tvl(project_address) {
					Ok(tvl) => println!("Total Value Locked: {}", tvl),
					Err(error) => eprintln!("Error calculating TVL: {:?}", error),
			}
	}
                    `}
                />
                <Footer />
            </div>
        </div>
    );
};
