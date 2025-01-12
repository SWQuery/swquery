"use client";
import { motion } from "framer-motion";
import { CopyBlock, obsidian } from "react-code-blocks";
import { Fira_Code } from "next/font/google";

interface CodeExampleProps {
  code: string;
}

const firaCode = Fira_Code({
  weight: "400",
  subsets: ["latin"],
});

export const CodeExample: React.FC<CodeExampleProps> = ({ code }) => {
  const customTheme = {
    ...obsidian,
    backgroundColor: "#0A0A0A",
    lineNumberColor: "#666",
    lineNumberBgColor: "#0A0A0A",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative w-full overflow-x-auto ${firaCode.className}`}
    >
      <div className="min-w-[320px] bg-[#1A1A1A] rounded-2xl p-2 md:p-3 shadow-lg">
        <div className="bg-[#0A0A0A] rounded-md p-6 md:p-8">
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#9C88FF]/20">
            <div className="flex space-x-2 items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-400">main.rs</span>
          </div>
          <div className="text-[.44rem] md:text-xs md:text-base">
            <CopyBlock
              text={code}
              language="rust"
              theme={customTheme}
              showLineNumbers
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
