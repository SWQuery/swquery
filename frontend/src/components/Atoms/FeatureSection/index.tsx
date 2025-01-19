import React from 'react';
import { CodeExample } from '../CodeExample';

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  codeSnippet: string;
  reversed?: boolean;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink,
  codeSnippet,
  reversed = false,
}) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}>
        <div className="w-full md:w-1/2 space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h3>
          <h4 className="text-xl text-gray-400">{subtitle}</h4>
          <p className="text-gray-300 leading-relaxed">{description}</p>
          <a
            href={buttonLink}
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            {buttonText}
          </a>
        </div>
        <div className="w-full md:w-1/2">
          <div className="feature-card p-4">
            <CodeExample code={codeSnippet} />
          </div>
        </div>
      </div>
    </div>
  );
}; 