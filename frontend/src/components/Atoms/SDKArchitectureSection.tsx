import React from "react";
import { motion } from "framer-motion";
import { FileText, Key, Database, Server, Layers } from "lucide-react";

export const SDKArchitectureSection: React.FC = () => {
    const steps = [
        {
            Icon: FileText,
            title: "Smart Contracts Execution",
            description: "Executes smart contracts and updates blockchain states securely.",
        },
        {
            Icon: Key,
            title: "Cryptographic Proofs",
            description: "Ensures security with zk-SNARKs for private validation.",
        },
        {
            Icon: Database,
            title: "Data Extraction",
            description: "Fetches and validates data from distributed blockchain nodes.",
        },
        {
            Icon: Server,
            title: "Consensus Mechanism",
            description: "Coordinates leader nodes for transaction validation.",
        },
        {
            Icon: Layers,
            title: "State Update",
            description: "Applies signed transactions to update blockchain states.",
        },
    ];

    // Variants for the SVG line draw animation
    const svgVariants = {
        hidden: { pathLength: 0 },
        visible: {
            pathLength: 1,
            transition: { duration: 2, ease: "easeInOut" }
        }
    };

    // Variants for individual step blocks
    const blockVariants = (index: number) => ({
        hidden: { opacity: 0, y: 30, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { 
                delay: 1 + index * 0.7, // Delay to appear after line "reaches" them
                duration: 0.6,
                ease: "easeOut"
            },
        },
    });

    return (
        <div className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#101010] text-white relative overflow-hidden">
            <div className="container mx-auto text-center relative">
                <h2 className="text-4xl font-bold mb-10">SDK Workflow</h2>
                <p className="mb-12 text-lg text-gray-400">
                    Experience the step-by-step progression of the SDK in a futuristic pipeline.
                </p>

                {/* Decorative background particles (optional) */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#202020, #0A0A0A)] opacity-70"></div>
                    {/* Add subtle animated particles or static stars if desired */}
                </div>

                <div className="relative flex justify-center">
                    {/* SVG line container */}
                    <div className="w-full max-w-4xl relative">
                        {/* The SVG line that connects the steps.
                            We'll draw a curved path going through each step position.
                            Adjust the path as needed for aesthetics. */}
                        <motion.svg
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{ visible: { transition: { staggerChildren: 0.4 } } }}
                            className="w-full h-[200px] md:h-[250px] lg:h-[300px]"
                        >
                            <motion.path
                                d="M 5 150 
                                   C 20 120, 100 50, 200 100 
                                   C 300 150, 400 230, 500 180
                                   C 600 140, 700 100, 790 150"
                                stroke="url(#lineGradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                variants={svgVariants}
                            />
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#9945FF" />
                                    <stop offset="50%" stopColor="#7f5af0" />
                                    <stop offset="100%" stopColor="#9945FF" />
                                </linearGradient>
                            </defs>
                        </motion.svg>

                        {/* Steps positioned along the line visually.
                            We'll place them absolutely at approximate positions matching the path. */}
                        <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-2 md:px-10 lg:px-14"
                             style={{transform: 'translateY(-20px)'}}>
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="relative flex flex-col items-center w-1/5 min-w-[120px]"
                                    variants={blockVariants(index)}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                >
                                    {/* Neon block container */}
                                    <div className="relative p-6 rounded-xl bg-[#141414] 
                                                    border border-[#3b3b3b] 
                                                    shadow-[0_0_20px_#9945FF33]
                                                    hover:shadow-[0_0_30px_#9945FF55] 
                                                    transition-shadow duration-500 ease-in-out"
                                    >
                                        <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-[#1e1e1e] 
                                                        shadow-[0_0_10px_#9945FF66]"
                                        >
                                            <step.Icon size={32} color="#9945FF" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-300 text-sm leading-snug">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
