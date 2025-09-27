import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "DEPOSIT WLD",
    content: "Deposit any amount of WLD tokens!"
  },
  {
    title: "HOLD THE DIAMOND",
    content: "Tap the diamond at least once every 5 seconds to keep holding it"
  },
  {
    title: "WATCH THE VALUE CHANGE",
    content: "If you stop tapping you lose the diamond but receive the prize"
  }
];

export function Tutorial({ onComplete }: TutorialProps) {
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
          <h2 className="text-2xl mb-4">{tutorialSteps[currentStep].title}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {tutorialSteps[currentStep].content}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep ? 'bg-primary' : 'bg-gray-300'
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
            <ChevronLeft className="w-4 h-4" />
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
            <ChevronRight className="w-4 h-4" />
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
          Skip Tutorial
        </Button>
      </div>
    </div>
  );
}