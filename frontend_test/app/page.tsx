'use client';

import Image from "next/image";
import HorizontalLogo from "../public/horizontal-logo.svg";
import { motion } from 'framer-motion';
import { Database, Layers, ZoomIn, PieChart, Brain, Globe, ChevronRight, ShieldCheck, Copy } from 'lucide-react';
import { useState } from "react";

export default function Home() {

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`pub fn get_token_transactions(
  address: &str,
  period: Vec<u64, u64>
) -> TokenTransactionResponse {
  todo!("Not implemented yet");
}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#101010] text-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-4"
        >
          <Image src={HorizontalLogo} alt="Logo" width={250} unoptimized />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-x-4 flex items-center"
        >
          <select className="bg-[#1A1A1A] text-gray-400 px-4 py-2 rounded-full border border-[#14F195]">
            <option>Devnet</option>
            <option>Mainnet</option>
            <option>Testnet</option>
          </select>
          <button className="bg-gradient-to-r from-[#14F195] to-[#00D1FF] text-black px-4 py-2 rounded-full hover:opacity-80 transition-all shadow-lg">
            Connect Wallet
          </button>
        </motion.div>
      </nav>

      <main className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#9C88FF] via-[#6C5CE7] to-[#2D88E6]">
            Consultas de transações em sua wallet com linguagem natural
          </h2>
          <p className="text-lg mb-8 text-gray-300 leading-relaxed">
            Utilize o potencial da tecnologia blockchain da Solana para consultar e visualizar transações com facilidade e velocidade inigualável, usando a inteligência da nossa plataforma.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] p-2 rounded-full shadow-md">
                <Database className="text-black" size={32} />
              </div>
              <span className="text-lg">Extração de Dados Simplificada</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-[#6C5CE7] to-[#2D88E6] p-2 rounded-full shadow-md">
                <Layers className="text-black" size={32} />
              </div>
              <span className="text-lg">Transformação Inteligente de Dados</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] p-2 rounded-full shadow-md">
                <ZoomIn className="text-black" size={32} />
              </div>
              <span className="text-lg">Visualização de Dados Abrangente</span>
            </div>
          </motion.div>
          <div className="mt-10 flex space-x-4">
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-gradient-to-r from-[#9C88FF] to-[#6C5CE7] px-6 py-3 rounded-full hover:opacity-80 transition-all shadow-lg"
            >
              Explore Platform
            </motion.button>
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="border border-[#9C88FF] px-6 py-3 rounded-full hover:bg-[#9C88FF] hover:text-black transition-all shadow-lg"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

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
{`pub fn get_token_transactions(
  address: &str,
  period: Vec<u64, u64>
) -> TokenTransactionResponse {
  todo!("Not implemented yet");
}`}
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
      </main>

      <section className="container mx-auto px-6 py-16 text-center">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#14F195] to-[#00D1FF]"
        >
          Como Funciona
        </motion.h3>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md"
          >
            <ChevronRight className="text-[#14F195] mx-auto" size={48} />
            <h4 className="text-xl font-bold mt-4">Conecte sua Wallet</h4>
            <p className="text-gray-400 mt-2">
              Use sua carteira Solana para integrar ao sistema SWquery.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md"
          >
            <ChevronRight className="text-[#9945FF] mx-auto" size={48} />
            <h4 className="text-xl font-bold mt-4">Selecione os Dados</h4>
            <p className="text-gray-400 mt-2">
              Escolha as transações que deseja consultar e filtrar.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md"
          >
            <ChevronRight className="text-[#00D1FF] mx-auto" size={48} />
            <h4 className="text-xl font-bold mt-4">Visualize Resultados</h4>
            <p className="text-gray-400 mt-2">
              Acesse visualizações intuitivas e relatórios personalizados.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#14F195] to-[#00D1FF]">
          Funcionalidades que destacam nossa plataforma
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md hover:scale-105 transition-transform"
          >
            <Brain className="text-[#14F195] mx-auto" size={48} />
            <h4 className="text-xl font-bold mt-4">IA Avançada</h4>
            <p className="text-gray-400 mt-2">
              Soluções inteligentes para análise automatizada de dados complexos.
            </p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md hover:scale-105 transition-transform"
          >
            <PieChart className="text-[#9945FF] mx-auto" size={48} />
            <h4 className="text-xl font-bold mt-4">Visualizações Intuitivas</h4>
            <p className="text-gray-400 mt-2">
              Gráficos e relatórios claros para interpretação instantânea.
            </p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md hover:scale-105 transition-transform"
          >
            <Globe className="text-[#00D1FF] mx-auto" size={48} />
            <h4 className="text-xl font-bold mt-4">Conexão Global</h4>
            <p className="text-gray-400 mt-2">
              Integração perfeita com a rede Solana em qualquer lugar do mundo.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#14F195] to-[#00D1FF]">
          Benefícios Técnicos
        </h3>
        <div className="grid md:grid-cols-2 gap-12 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md"
          >
            <ShieldCheck className="text-[#14F195]" size={48} />
            <h4 className="text-xl font-bold mt-4">Segurança de Ponta</h4>
            <p className="text-gray-400 mt-2">
              Garantimos a segurança dos seus dados com criptografia avançada e padrões de segurança de blockchain.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1A1A1A] rounded-xl p-6 shadow-md"
          >
            <PieChart className="text-[#9945FF]" size={48} />
            <h4 className="text-xl font-bold mt-4">Escalabilidade</h4>
            <p className="text-gray-400 mt-2">
              Nossa solução é otimizada para lidar com grandes volumes de transações sem perda de desempenho.
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="container mx-auto px-6 py-8 text-center border-t border-[#14F195]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-gray-400"
        >
          © 2024 SWquery. Powered by Solana. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
}
