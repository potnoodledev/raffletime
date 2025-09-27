'use client';

import { Button } from './ui/button';
import type { HomeScreenProps } from '@/types/minigame';
import { MINIGAME_ASSETS } from '@/types/minigame';

export function HomeScreen({ onStartDeposit, onShowTutorial }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Diamond Hands</h1>
        <div className="mb-8">
          <img
            src={MINIGAME_ASSETS.diamond}
            alt="Diamond"
            className="w-32 h-32 mx-auto object-contain animate-pulse"
          />
        </div>
        <p className="text-gray-600 text-lg mb-8 max-w-md">
          How long can you hold on to your diamond? Watch the price change and decide when to sell!
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button
          onClick={onStartDeposit}
          className="w-full py-4 text-lg"
          size="lg"
        >
          Start Playing
        </Button>

        <Button
          onClick={onShowTutorial}
          variant="outline"
          className="w-full py-4 text-lg"
          size="lg"
        >
          How to Play
        </Button>
      </div>
    </div>
  );
}