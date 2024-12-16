'use client';
import { motion } from 'framer-motion';
import { CopyBlock, obsidian } from 'react-code-blocks';

interface CodeExampleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    code: string;
}

export const CodeExample: React.FC<CodeExampleProps> = ({ code }) => {
    const customTheme = {
        ...obsidian,
        backgroundColor: '#0A0A0A',
        lineNumberColor: '#666',
        lineNumberBgColor: '#0A0A0A',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center w-full"
        >
            <div className="w-full bg-[#1A1A1A] rounded-2xl p-2 md:p-4 shadow-lg">
                <div className="bg-[#0A0A0A] rounded-md border border-[#9C88FF]">
                    <div className="flex justify-between items-center p-2 border-b border-[#9C88FF]/20">
                        <div className="flex space-x-2 items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-400">main.rs</span>
                    </div>
                    <div className="text-sm md:text-base">
                        <CopyBlock
                            text={code}
                            language="rust"
                            theme={customTheme}
                            codeBlock
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

