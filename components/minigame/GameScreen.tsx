'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CircularCountdown } from './CircularCountdown';
import type { GameScreenProps } from '@/types/minigame';
import { MINIGAME_ASSETS, GAME_CONSTANTS } from '@/types/minigame';
import { generateVolatility, calculateNewPrice } from '@/lib/minigame/price-engine';

export function GameScreen({ originalDeposit, onGameEnd, onPlayAgain }: GameScreenProps) {
  const [currentPrice, setCurrentPrice] = useState(originalDeposit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [initialCountdown, setInitialCountdown] = useState(GAME_CONSTANTS.INITIAL_COUNTDOWN);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [backgroundRed, setBackgroundRed] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const [countdownKey, setCountdownKey] = useState(0);

  // Initial countdown before game starts
  useEffect(() => {
    if (initialCountdown > 0) {
      const timer = setTimeout(() => {
        setInitialCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (initialCountdown === 0 && !gameStarted) {
      setGameStarted(true);
      startPriceUpdates();
    }
  }, [initialCountdown, gameStarted]);

  // Price update system
  const startPriceUpdates = useCallback(() => {
    const updatePrice = () => {
      setCurrentPrice(prev => {
        const volatility = generateVolatility();
        return calculateNewPrice(prev, volatility);
      });
      setShowTapPrompt(true);
      setIsCountingDown(true);
      setCountdownKey(prev => prev + 1); // Reset countdown
    };

    updatePrice();
    const interval = setInterval(updatePrice, GAME_CONSTANTS.PRICE_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Handle tap to hold
  const handleTap = () => {
    if (!showTapPrompt || gameEnded) return;

    setShowTapPrompt(false);
    setIsCountingDown(false);
    setBackgroundRed(false);
    setShowSparkles(true);

    setTimeout(() => setShowSparkles(false), 1000);
  };

  // Handle countdown complete (user didn't tap)
  const handleCountdownComplete = useCallback(() => {
    if (!gameEnded) {
      setGameEnded(true);
      setFinalPrice(currentPrice);
      setShowSmoke(true);
      setShowTapPrompt(false);
      setIsCountingDown(false);
      onGameEnd(currentPrice);
    }
  }, [currentPrice, gameEnded, onGameEnd]);

  // Background red fade effect during countdown
  useEffect(() => {
    if (isCountingDown && showTapPrompt) {
      const timer = setTimeout(() => {
        setBackgroundRed(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setBackgroundRed(false);
    }
  }, [isCountingDown, showTapPrompt]);

  // Game ended state
  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-bold mb-4 text-red-600">SOLD!</h2>
            <p className="text-xl text-gray-800 mb-6">
              You sold your diamond for{' '}
              <strong data-testid="final-price">{finalPrice.toFixed(4)} WLD</strong>!
            </p>

            {showSmoke && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 1, 0] }}
                transition={{ duration: 2 }}
                className="mb-6"
                data-testid="smoke-effect"
              >
                <img
                  src={MINIGAME_ASSETS.smoke}
                  alt="Smoke"
                  className="w-32 h-32 mx-auto object-contain opacity-70"
                />
              </motion.div>
            )}
          </motion.div>

          <Button onClick={onPlayAgain} size="lg" className="px-8 py-4">
            PLAY AGAIN?
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
        backgroundRed ? 'bg-red-400' : 'bg-gradient-to-b from-blue-50 to-white'
      }`}
      animate={{ backgroundColor: backgroundRed ? '#f87171' : '#f8fafc' }}
      data-testid="game-container"
    >
      {/* Initial countdown overlay */}
      <AnimatePresence>
        {initialCountdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              key={initialCountdown}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-white text-8xl font-bold"
            >
              {initialCountdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game active indicator for tests */}
      {gameStarted && !gameEnded && (
        <div data-testid="game-active" className="sr-only">Game is active</div>
      )}

      {/* Price pills */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="bg-white rounded-full px-6 py-3 shadow-lg text-center border-2 border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-1 tracking-wide">CURRENT</div>
          <div className="text-2xl font-bold text-gray-900" data-testid="current-price">
            {currentPrice.toFixed(4)} <span className="text-lg text-gray-700">WLD</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-full px-6 py-3 text-center border-2 border-gray-300">
          <div className="text-xs font-semibold text-gray-700 mb-1 tracking-wide">ORIGINAL</div>
          <div className="text-xl font-semibold text-gray-800">{originalDeposit.toFixed(4)} <span className="text-lg text-gray-600">WLD</span></div>
        </div>
      </div>

      {/* Diamond area */}
      <div className="relative mb-8" data-testid="game-area" onClick={handleTap}>
        <motion.div
          className="relative cursor-pointer"
          whileTap={{ scale: 0.95 }}
          animate={gameEnded ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: gameEnded ? 0.5 : 0.1 }}
        >
          <img
            src={MINIGAME_ASSETS.diamond}
            alt="Diamond"
            className="w-48 h-48 object-contain"
          />

          {/* Sparkles effect */}
          <AnimatePresence>
            {showSparkles && (
              <div data-testid="sparkle-effect">
                {[...Array(6)].map((_, i) => (
                  <motion.img
                    key={i}
                    src={MINIGAME_ASSETS.sparkle}
                    alt="Sparkle"
                    className="absolute w-8 h-8"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{
                      scale: [0, 1.5, 0],
                      rotate: 360,
                      x: Math.random() * 40 - 20,
                      y: Math.random() * 40 - 20
                    }}
                    transition={{ duration: 1 }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tap prompt and countdown */}
        <AnimatePresence>
          {showTapPrompt && !gameEnded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 text-center w-full flex flex-col items-center"
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-6 py-3 shadow-xl mb-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 border-2 border-blue-400"
                onClick={handleTap}
              >
                <span className="text-xl font-bold text-white drop-shadow-sm">💎 Tap to Hold! 💎</span>
              </div>
              <div data-testid="countdown-circle">
                <CircularCountdown
                  duration={GAME_CONSTANTS.COUNTDOWN_DURATION}
                  onComplete={handleCountdownComplete}
                  isActive={isCountingDown}
                  resetKey={countdownKey.toString()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game instructions */}
      {gameStarted && !showTapPrompt && !gameEnded && (
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
            ⏱️ Wait for the next price update...
          </p>
        </div>
      )}
    </motion.div>
  );
}