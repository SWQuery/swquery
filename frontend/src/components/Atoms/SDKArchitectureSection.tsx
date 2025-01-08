import React from "react";
import { motion } from "framer-motion";
import { Database, Code, MessageSquare, Layers, Network } from "lucide-react";

export const SDKArchitectureSection: React.FC = () => {
  const steps = [
    {
      Icon: MessageSquare,
      title: "Natural Language Query",
      description:
        "Users submit queries in plain language, reducing the need for manual RPC calls.",
    },
    {
      Icon: Code,
      title: "AI Interpretation",
      description:
        "AI translates queries into structured JSON-RPC requests aligned with Solana methods.",
    },
    {
      Icon: Database,
      title: "Blockchain Data Retrieval",
      description:
        "Helius RPC nodes fetch real-time transaction and account data securely.",
    },
    {
      Icon: Network,
      title: "Response Formatting",
      description:
        "Blockchain responses are processed into human-readable formats or structured JSON.",
    },
    {
      Icon: Layers,
      title: "Integration & Visualization",
      description:
        "Data is visualized or integrated into apps, bots, and dashboards seamlessly.",
    },
  ];

  const svgVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: { duration: 2, ease: "easeInOut" },
    },
  };

  const blockVariants = (index: number) => ({
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.6 + index * 0.5,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  });

  return (
    <div className="py-24 bg-gradient-to-b text-white relative overflow-hidden">
      <div className="container mx-auto text-center relative">
        <h2 className="text-5xl font-extrabold mb-12">SWQuery SDK Workflow</h2>
        <p className="mb-16 text-lg text-gray-400 leading-relaxed">
          Discover how SWQuery streamlines blockchain data extraction through AI
          and intuitive workflows.
        </p>

        {/* Desktop Layout: SVG and absolute positioned steps */}
        <div className="hidden md:flex relative justify-center">
          <div className="w-full max-w-5xl relative">
            <motion.svg
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: { staggerChildren: 0.5 },
                },
              }}
              className="w-full h-[220px] md:h-[280px] lg:h-[320px] hidden md:block"
            >
              <motion.path
                d="M 5 160 
                   C 30 130, 120 70, 220 120 
                   C 320 170, 440 250, 560 200
                   C 660 160, 780 110, 880 160"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                variants={svgVariants}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#E156FF" />
                  <stop offset="50%" stopColor="#8F00FF" />
                  <stop offset="100%" stopColor="#E156FF" />
                </linearGradient>
              </defs>
            </motion.svg>

            <div
              className="hidden md:flex absolute top-0 left-0 w-full h-full justify-between items-center px-4 md:px-12 lg:px-16"
              style={{ transform: "translateY(-20px)" }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative flex flex-col items-center w-1/5 min-w-[140px]"
                  variants={blockVariants(index)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div
                    className="p-6 rounded-xl bg-[#161616] border border-[#414141] 
                               shadow-[0_0_25px_#8F00FF55] hover:shadow-[0_0_35px_#E156FFAA] 
                               transition-shadow duration-500 ease-in-out"
                  >
                    <div
                      className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-[#242424] 
                                 shadow-[0_0_15px_#E156FF88]"
                    >
                      <step.Icon size={36} color="#E156FF" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-md leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout: Vertical stack of steps */}
        <div className="flex flex-col space-y-6 md:hidden mt-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center px-4"
              variants={blockVariants(index)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div
                className="p-6 rounded-xl bg-[#161616] border border-[#414141] 
                           shadow-[0_0_25px_#8F00FF55] hover:shadow-[0_0_35px_#E156FFAA] 
                           transition-shadow duration-500 ease-in-out mb-4"
              >
                <div
                  className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-[#242424] 
                             shadow-[0_0_15px_#E156FF88] mx-auto"
                >
                  <step.Icon size={36} color="#E156FF" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-md leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
