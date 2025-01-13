import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageSquareText, Search, BarChart2 } from 'lucide-react';
import { setCookie, getCookie } from 'cookies-next/client';
import { Card, CardContent } from '@/components/Atoms/CardComponent';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Solana Account Analysis",
    content: "Our natural language chat interface allows you to analyze Solana account transactions with simple English queries. Let's walk through how to make the most of this tool.",
    icon: MessageSquareText
  },
  {
    title: "Ask Questions Naturally",
    content: "Simply type your questions about any Solana account. For example: 'Show me all transactions above 5 SOL from last week' or 'What's the most common interaction pattern for this account?'",
    icon: Search
  },
  {
    title: "Understanding Results",
    content: "We'll break down complex blockchain data into clear, readable insights. You'll see transaction patterns, frequent interactions, and notable activities all explained in plain English.",
    icon: BarChart2
  }
];

export const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const hasSeenTutorial = getCookie('tutorial_completed');
    if (hasSeenTutorial === 'true') {
      onClose();
    }
  }, [onClose]);

  const completeTutorial = () => {
    setCookie('tutorial_completed', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    onClose();
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const CurrentIcon = tutorialSteps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full mx-4 md:mx-0 md:w-1/2 max-w-4xl">
        <Card className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <CardContent className="space-y-6">
            {/* Progress indicator */}
            <div className="flex gap-2 justify-center mb-8">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-12 rounded-full transition-colors ${
                    index === currentStep ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Tutorial content */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-semibold text-white">
                {tutorialSteps[currentStep].title}
              </h2>
              
              <div className="flex justify-center items-center">
                <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full">
                  <CurrentIcon size={80} className="text-purple-500" strokeWidth={1.5} />
                </div>
              </div>
              
              <p className="text-gray-300 text-lg">
                {tutorialSteps[currentStep].content}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:bg-gray-800'
                }`}
                disabled={currentStep === 0}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <button
                onClick={skipTutorial}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Skip tutorial
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white hover:opacity-90 transition-colors"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tutorialSteps.length - 1 && <ChevronRight size={20} />}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorialModal;