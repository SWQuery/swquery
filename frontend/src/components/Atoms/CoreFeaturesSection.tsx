// CoreFeaturesSection.tsx
import { ReactNode } from "react";
import { Server, TrendingUp, Lock } from "lucide-react";

interface CoreFeature {
  Icon: ReactNode;
  title: string;
  description: string;
}

const coreFeatures: CoreFeature[] = [
  {
    Icon: <Server className="h-12 w-12 text-[#9945FF]" />, // Representa infraestrutura robusta
    title: "Scalable Architecture",
    description:
      "SWquery is built on a scalable infrastructure, ensuring high performance and reliability for querying blockchain data.",
    },
    {
    Icon: <TrendingUp className="h-12 w-12 text-[#9945FF]" />, // Representa insights de dados
    title: "Actionable Insights",
    description:
      "Transform raw transaction data into meaningful insights for decision-making and DeFi opportunities.",
  },
  {
    Icon: <Lock className="h-12 w-12 text-[#9945FF]" />, // Representa segurança
    title: "Enterprise-Grade Security",
    description:
      "All queries and data handling are secured with robust encryption, ensuring user data privacy and safety.",
  },
];

export const CoreFeaturesSection = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-[#101010] to-[#181818] text-white">
      <h2 className="text-center text-4xl font-bold mb-8">
        Why Choose SWquery?
      </h2>
      <p className="text-center mb-12 text-gray-400">
        Beyond seamless wallet integration, SWquery provides a reliable, secure, and scalable platform tailored for developers and enterprises. Empower your blockchain projects with precision and innovation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
        {coreFeatures.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-4">{feature.Icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
