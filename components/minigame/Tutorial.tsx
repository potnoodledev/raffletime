'use client';

import { useState, memo } from 'react';
import { Button } from './ui/button';
import type { TutorialProps } from '@/types/minigame';

const tutorialSteps = [
  {
    title: "Welcome to Diamond Hands",
    content: "A thrilling game of holding onto your valuable diamond while watching its price fluctuate!"
  },
  {
    title: "How to Play",
    content: "Tap the screen to hold your diamond when the countdown appears. If you don't tap in time, you'll sell automatically!"
  },
  {
    title: "Ready to Start?",
    content: "Watch the price change every 5 seconds. Hold as long as you can to maximize your gains - or let it sell when you're satisfied!"
  }
];

export const Tutorial = memo(function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {tutorialSteps[currentStep].title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {tutorialSteps[currentStep].content}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              data-testid={`progress-dot-${index}`}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600 active' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>

          <span className="text-sm text-gray-500">
            {currentStep + 1} of {tutorialSteps.length}
          </span>

          <Button
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Skip Tutorial button */}
      <div className="mt-6">
        <Button
          variant="ghost"
          onClick={onComplete}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip
        </Button>
      </div>
    </div>
  );
});