import { Footer } from "@/components/Molecules/Landing/Footer";
import { Intro } from "@/components/Molecules/Landing/Intro";
import { Section } from "@/components/Molecules/Landing/Section";
import { Navbar } from "@/components/Molecules/Navbar";
import { FeatureSection } from "@/components/Atoms/FeatureSection";
import { SDKArchitectureSection } from "@/components/Atoms/SDKArchitectureSection";
import { Wallet, Filter, BarChart } from "lucide-react";
import { CoreFeaturesSection } from "@/components/Atoms/CoreFeaturesSection";
import { useEffect, useState, useMemo } from 'react';

interface NeuralNode {
  id: number;
  x: number;
  y: number;
  connections: number[];
  speed: number;
}

export const Landing: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollProgress, setScrollProgress] = useState(0);

 
  const neuralNodes = useMemo(() => {
    const nodes: NeuralNode[] = [];
    const gridSize = 6; // 6x6 grid for more nodes
    
    for (let i = 0; i < 36; i++) {
      const gridX = (i % gridSize) / gridSize;
      const gridY = Math.floor(i / gridSize) / gridSize;
      
   
      const x = (gridX * 90 + Math.random() * 10) + 5;
      const y = (gridY * 90 + Math.random() * 10) + 5;
      
      nodes.push({
        id: i,
        x,
        y,
        connections: [],
        speed: Math.random() * 2 + 1
      });
    }


    return nodes.map(node => {
      const connections: number[] = [];
      const numConnections = Math.floor(Math.random() * 3) + 2; // 2-4 connections
      
      const otherNodes = nodes
        .filter(n => n.id !== node.id)
        .sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.x - node.x, 2) + Math.pow(a.y - node.y, 2));
          const distB = Math.sqrt(Math.pow(b.x - node.x, 2) + Math.pow(b.y - node.y, 2));
          return distA - distB;
        });

      for (let i = 0; i < numConnections && i < otherNodes.length; i++) {
        connections.push(otherNodes[i].id);
      }
      
      return { ...node, connections };
    });
  }, []);


  const flowingParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      wobble: Math.random() * 4 - 2,
      speed: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
      description: "Choose the transactions you want to query and filter.",
    },
    {
      Icon: BarChart,
      iconColor: "#9945FF",
      title: "Visualize Results",
      description: "Access intuitive visualizations and personalized reports.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden perspective-[2000px]">
      {/* Background with a hazy, underwater effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(25, 35, 65, 0.7) 0%, 
              rgba(15, 25, 40, 0.8) 30%, 
              rgba(0, 0, 10, 0.95) 100%
            )
          `,
          filter: 'blur(120px)',
          transform: 'scale(1.2)',
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Animated sine wave pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(153, 69, 255, 0.1) 0%,
              transparent 20%,
              transparent 80%,
              rgba(153, 69, 255, 0.1) 100%
            )
          `,
          maskImage: `
            repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 50px,
              black 50px,
              black 100px
            )
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 50px,
              black 50px,
              black 100px
            )
          `,
          transform: `translateY(${mousePosition.y * 0.1}px)`,
          animation: 'waveFlow 30s linear infinite'
        }}
      />

      {/* Floating shapes */}
      {[0, 1, 2].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 120 - 10}%`,
            width: `${Math.random() * 20 + 10}vw`,
            height: `${Math.random() * 20 + 10}vw`,
            background: `rgba(153, 69, 255, ${Math.random() * 0.15 + 0.05})`,
            clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
            transform: `
              translateX(${(mousePosition.x - 50) * 0.1}px)
              translateY(${(mousePosition.y - 50) * 0.1}px)
              translateZ(${Math.random() * 100 - 50}px)
              rotate(${Math.random() * 360}deg)
            `,
            filter: 'blur(30px)',
            animation: `float ${Math.random() * 5 + 15}s ease-in-out infinite`
          }}
        />
      ))}

      {/* Slow-moving bubble elements */}
      {[0, 1].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 120 - 10}%`,
            width: `${Math.random() * 10 + 5}vw`,
            height: `${Math.random() * 10 + 5}vw`,
            background: 'radial-gradient(circle at center, rgba(180, 220, 255, 0.15), transparent 70%)',
            filter: 'blur(15px)',
            opacity: Math.random() * 0.4 + 0.1,
            transform: `
              translateX(${(mousePosition.x - 50) * 0.05}px)
              translateY(${(mousePosition.y - 50) * 0.05}px)
              translateZ(${Math.random() * 100 - 50}px)
            `,
            animation: `float ${Math.random() * 5 + 15}s ease-in-out infinite`
          }}
        />
      ))}

      {/* Flowing particles with a viscous, organic movement */}
      {flowingParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'radial-gradient(circle at center, rgba(180, 220, 255, 0.5), transparent 70%)',
            filter: 'blur(3px)',
            opacity: particle.opacity,
            transform: `
              translateX(${(mousePosition.x - particle.x) * 0.03}px)
              translateY(${(mousePosition.y - particle.y) * 0.03}px)
              translateZ(${particle.speed * 20}px)
            `,
            animation: `
              float ${5 + particle.speed * 4}s ease-in-out infinite,
              wobble ${2 + particle.speed}s ease-in-out infinite,
              flow ${40 + particle.speed * 10}s linear infinite
            `,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      {/* Mouse distortion effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(153, 69, 255, 0.1) 0%, transparent 8%)`,
          transform: 'translateZ(200px)',
          filter: 'blur(50px)',
          opacity: 0.5,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Neural network with reduced pulsing */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(153, 69, 255, 0.3)" />
              <stop offset="50%" stopColor="rgba(180, 220, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(153, 69, 255, 0.3)" />
            </linearGradient>
            <radialGradient id="nodeGradient">
              <stop offset="0%" stopColor="rgba(153, 69, 255, 0.7)" />
              <stop offset="100%" stopColor="rgba(153, 69, 255, 0.3)" />
            </radialGradient>
          </defs>
          {neuralNodes.map(node => 
            node.connections.map((targetId, index) => {
              const target = neuralNodes[targetId];
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              const midX = (node.x + target.x) / 2;
              const midY = (node.y + target.y) / 2;
              const curvature = 15 + Math.sin(Date.now() / (2000 + node.id * 100)) * 5;
              
              const perpX = midX + curvature * (dy / distance);
              const perpY = midY - curvature * (dx / distance);

              const mouseDistance = Math.sqrt(
                Math.pow((mousePosition.x - midX), 2) + 
                Math.pow((mousePosition.y - midY), 2)
              );
              const interactionRadius = 30;
              const interactionStrength = Math.max(0, 1 - (mouseDistance / interactionRadius));
              
              return (
                <g key={`${node.id}-${targetId}-${index}`}>
                  <path
                    d={`M ${node.x}% ${node.y}% Q ${perpX}% ${perpY}% ${target.x}% ${target.y}%`}
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth={1.5 + interactionStrength * 2}
                    style={{
                      filter: `blur(${interactionStrength}px)`,
                      opacity: 0.5 + interactionStrength * 0.3,
                      transform: `translate(${(mousePosition.x - midX) * 0.01}px, ${(mousePosition.y - midY) * 0.01}px)`,
                      animation: `pulseLine ${3 + node.id % 3}s ease-in-out infinite, wobble ${4 + node.id % 2}s ease-in-out infinite`
                    }}
                  />
                </g>
              );
            })
          )}
          {neuralNodes.map((node) => (
            <circle
              key={`node-${node.id}`}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={3 + Math.abs((mousePosition.x - node.x) * 0.03)}
              fill="url(#nodeGradient)"
              style={{
                filter: 'blur(2px) drop-shadow(0 0 4px rgba(153, 69, 255, 0.7))',
                transform: `translate(${(mousePosition.x - node.x) * 0.02}px, ${(mousePosition.y - node.y) * 0.02}px)`,
                animation: `pulseNode ${3 + node.id % 3}s ease-in-out infinite, wobble ${4 + node.id % 2}s ease-in-out infinite`,
                animationDelay: `${node.id * 0.1}s`
              }}
            />
          ))}
        </svg>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }

          @keyframes wobble {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          @keyframes flow {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-300vw, 300vh); }
          }

          @keyframes waveFlow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-200vw); }
          }

          @keyframes pulseNode {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.7;
            }
            50% { 
              transform: scale(1.2);
              opacity: 0.9;
            }
          }

          @keyframes pulseLine {
            0%, 100% { 
              opacity: 0.5;
              stroke-width: 1.5px;
            }
            50% { 
              opacity: 0.8;
              stroke-width: 2px;
            }
          }

          .feature-card {
            background: rgba(20, 30, 48, 0.5);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(153, 69, 255, 0.3);
            border-radius: 12px;
            transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .feature-card:hover {
            transform: translateY(-8px) translateZ(80px);
            border-color: rgba(153, 69, 255, 0.8);
            box-shadow: 
              0 20px 60px rgba(0, 10, 20, 0.5),
              0 0 0 1px rgba(153, 69, 255, 0.6),
              0 0 40px rgba(153, 69, 255, 0.6);
          }
        `}</style>

        <Navbar />
        <div className="pt-28 md:pt-40">
          <Intro />
          <Section
            title="How It Works"
            items={itemsHowItWorks}
            columns={3}
            textAlign="center"
          />
          <SDKArchitectureSection />
          <CoreFeaturesSection />
          <FeatureSection
            title="Query Wallet Transactions"
            subtitle="Real-Time Data Retrieval."
            description="Leverage the SWquery SDK to fetch and analyze wallet transactions instantly."
            buttonText="View Documentation"
            buttonLink="https://bretasarthur1.gitbook.io/swquery/"
          />
          <Footer />
        </div>
      </div>
    </div>
  );
};
