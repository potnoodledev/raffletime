'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { GameScreen as GameScreenType } from '@/types/minigame';

// Static imports for immediate components
import { Tutorial } from './Tutorial';
import { HomeScreen } from './HomeScreen';
import { DepositWorkflow } from './DepositWorkflow';
import { ErrorBoundary } from './ErrorBoundary';

// Dynamic import for GameScreen to avoid SSR issues with Framer Motion
const GameScreen = dynamic(
  () => import('./GameScreen').then(mod => ({ default: mod.GameScreen })),
  { ssr: false }
);

export function MinigameApp() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('tutorial');
  const [depositAmount, setDepositAmount] = useState(0);

  const handleTutorialComplete = () => {
    setCurrentScreen('home');
  };

  const handleStartDeposit = () => {
    setCurrentScreen('deposit');
  };

  const handleShowTutorial = () => {
    setCurrentScreen('tutorial');
  };

  const handleDepositComplete = (amount: number) => {
    setDepositAmount(amount);
    setCurrentScreen('game');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleGameEnd = (finalPrice: number) => {
    // Game ended logic - could add analytics here
    console.log('Game ended with final price:', finalPrice);
  };

  const handlePlayAgain = () => {
    setCurrentScreen('deposit');
  };

  return (
    <ErrorBoundary>
      <div className="size-full min-h-screen">
        {currentScreen === 'tutorial' && (
          <Tutorial onComplete={handleTutorialComplete} />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            onStartDeposit={handleStartDeposit}
            onShowTutorial={handleShowTutorial}
          />
        )}

        {currentScreen === 'deposit' && (
          <DepositWorkflow
            onComplete={handleDepositComplete}
            onBack={handleBackToHome}
          />
        )}

        {currentScreen === 'game' && (
          <GameScreen
            originalDeposit={depositAmount}
            onGameEnd={handleGameEnd}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}