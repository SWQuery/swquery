"use client";
import React from "react";
import { motion } from "framer-motion";
import { CopyBlock, obsidian } from "react-code-blocks";
import { Fira_Code } from "next/font/google";

const firaCode = Fira_Code({
  weight: "400",
  subsets: ["latin"],
});

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  codeSnippet?: string;
  codeLanguage?: string;
  codeFileName?: string;
  reversed?: boolean;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink,
  codeSnippet,
  codeLanguage = "rust",
  codeFileName = "example.rs",
  reversed = false,
}) => {
  const customTheme = {
    ...obsidian,
    backgroundColor: "#0A0A0A",
    lineNumberColor: "#666",
    lineNumberBgColor: "#0A0A0A",
  };

  return (
    <section className="py-5 md:py-20">
      <div className="container mx-auto px-4">
        <div
          className={`
            flex flex-col 
            ${reversed ? "md:flex-row-reverse" : "md:flex-row"} 
            items-center gap-10
          `}
        >
          {/* Text Content */}
          <motion.div
            className="flex-1 min-w-0" 
            initial={{ opacity: 0, x: reversed ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-2">
              {title}{" "}
              <span className="text-[#9945FF]">{subtitle}</span>
            </h2>
            <p className="text-gray-300 mb-6">{description}</p>
            <motion.a
              href={buttonLink}
              className="inline-block bg-[#9945FF] text-white py-2 px-6 rounded-full font-semibold hover:bg-[#8134FF] transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {buttonText}
            </motion.a>
          </motion.div>

          {/* Code Snippet */}
          {codeSnippet && (
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0, x: reversed ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div
                className={`
                  ${firaCode.className} w-full max-w-full 
                  overflow-x-auto break-words whitespace-pre-wrap 
                  flex justify-center items-center
                `}
              >
                <div className="w-full bg-[#1E1E1E] rounded-xl p-1 shadow-lg hidden md:block">
                  <div className="bg-[#141414] rounded-lg">
                    <div className="flex justify-between items-center p-2 border-b border-[#9945FF]/20">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {codeFileName}
                      </span>
                    </div>
                    <div className="text-sm">
                      <CopyBlock
                        text={codeSnippet}
                        language={codeLanguage}
                        theme={customTheme}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
