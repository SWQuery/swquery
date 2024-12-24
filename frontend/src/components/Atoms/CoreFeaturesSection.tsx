import { ReactNode } from "react";
import { Server, TrendingUp, Lock } from "lucide-react";

interface CoreFeature {
	Icon: ReactNode;
	title: string;
	description: string;
}

const coreFeatures: CoreFeature[] = [
	{
		Icon: <Server className="h-14 w-14 text-[#E156FF]" />, // Infrastructure Icon
		title: "Scalable Architecture",
		description:
			"SWQuery leverages robust, scalable infrastructure to handle high-frequency blockchain queries with ease, ensuring consistent performance even at scale.",
	},
	{
		Icon: <TrendingUp className="h-14 w-14 text-[#E156FF]" />, // Insights Icon
		title: "Actionable Insights",
		description:
			"Unlock the power of blockchain data by transforming raw transactions into actionable insights, driving better decisions in DeFi and beyond.",
	},
	{
		Icon: <Lock className="h-14 w-14 text-[#E156FF]" />, // Security Icon
		title: "Enterprise-Grade Security",
		description:
			"Security is at the core of SWQuery. Advanced encryption and secure protocols safeguard user queries and sensitive data at every touchpoint.",
	},
];

export const CoreFeaturesSection = () => {
    return (
        <div className="py-24 bg-gradient-to-b text-white relative overflow-hidden">
            <div className="container mx-auto text-center relative">
                <h2 className="text-5xl font-extrabold mb-10">
                    Why SWQuery Stands Out
                </h2>
                <p className="mb-16 text-lg text-gray-400 leading-relaxed">
                    SWQuery isn&apos;t just an SDK; it&apos;s a
                    performance-driven platform designed for developers and
                    enterprises to harness blockchain data with unmatched speed
                    and reliability.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8 relative z-10">
                    {coreFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="text-center bg-[#181818] p-8 rounded-2xl border border-[#3b3b3b] shadow-lg 
                         shadow-[#8F00FF33] hover:shadow-[#E156FF55] transition-all duration-500 ease-in-out"
                        >
                            <div className="flex justify-center mb-6">
                                {feature.Icon}
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 text-md leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
