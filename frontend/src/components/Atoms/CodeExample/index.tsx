'use client';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import { useState } from 'react';

interface CodeExampleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	code: string;
}

export const CodeExample: React.FC<CodeExampleProps>  = ({ code, ...rest }) => {

    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center"
            >
            <div className="w-full max-w-lg bg-[#1A1A1A] rounded-2xl p-8 shadow-lg">
                <div className="bg-[#0A0A0A] rounded-md p-4 border border-[#9C88FF]">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex space-x-2 items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-400">main.rs</span>
                </div>
                <pre className="bg-[#101010] rounded-lg p-4 text-sm text-[#9C88FF] font-mono overflow-x-auto">
                    <code>
                        {code}
                    </code>
                </pre>
                <div className="flex justify-end mt-4">
                    <button
                    onClick={handleCopy}
                    className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] px-4 py-2 rounded-full text-white shadow-md hover:opacity-80 transition-all flex items-center"
                    >
                    <Copy size={16} className="mr-2" />
                    {copySuccess ? "Copied!" : "Copy Code"}
                    </button>
                </div>
                </div>
            </div>
        </motion.div>
    );
};