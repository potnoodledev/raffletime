import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { CircularCountdown } from './CircularCountdown';
import { motion, AnimatePresence } from 'motion/react';
import diamondImg from 'figma:asset/a873c9fb942c6e4d973274b08ebacd928c30e2f2.png';
import sparkleImg from 'figma:asset/ff12fad9729fcbf831a224a35f170b22a2e3da05.png';
import smokeImg from 'figma:asset/857a5e5f1762cf5e45986d9435be437d58b86821.png';

interface GameScreenProps {
  originalDeposit: number;
  onGameEnd: (finalPrice: number) => void;
  onPlayAgain: () => void;
}

export function GameScreen({ originalDeposit, onGameEnd, onPlayAgain }: GameScreenProps) {
  const [currentPrice, setCurrentPrice] = useState(originalDeposit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [initialCountdown, setInitialCountdown] = useState(3);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [backgroundRed, setBackgroundRed] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const [countdownReset, setCountdownReset] = useState(false);

  // Initial 3-second countdown
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
        const volatility = 0.015 + (Math.random() - 0.5) * 0.11; // -4% to +7%
        const newPrice = prev * (1 + volatility);
        return Math.max(0.0001, parseFloat(newPrice.toFixed(4)));
      });
      setShowTapPrompt(true);
      setIsCountingDown(true);
      setCountdownReset(prev => !prev);
    };

    updatePrice();
    const interval = setInterval(updatePrice, 5000);
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

  // Background red fade effect
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

  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-4xl mb-4 text-red-600">SOLD!</h2>
            <p className="text-xl text-gray-800 mb-6">
              You sold your diamond for <strong>{finalPrice.toFixed(4)} WLD</strong>!
            </p>
            
            {showSmoke && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 1, 0] }}
                transition={{ duration: 2 }}
                className="mb-6"
              >
                <img 
                  src={smokeImg} 
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
              className="text-white text-8xl"
            >
              {initialCountdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price pills */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="bg-white rounded-full px-6 py-3 shadow-lg text-center">
          <div className="text-sm text-gray-600 mb-1">CURRENT</div>
          <div className="text-xl">{currentPrice.toFixed(4)} WLD</div>
        </div>
        <div className="bg-gray-100 rounded-full px-6 py-3 text-center">
          <div className="text-sm text-gray-600 mb-1">ORIGINAL</div>
          <div className="text-xl">{originalDeposit.toFixed(4)} WLD</div>
        </div>
      </div>

      {/* Diamond area */}
      <div className="relative mb-8">
        <motion.div
          className="relative cursor-pointer"
          onClick={handleTap}
          whileTap={{ scale: 0.95 }}
          animate={gameEnded ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: gameEnded ? 0.5 : 0.1 }}
        >
          <img 
            src={diamondImg} 
            alt="Diamond" 
            className="w-48 h-48 object-contain"
          />
          
          {/* Sparkles effect */}
          <AnimatePresence>
            {showSparkles && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.img
                    key={i}
                    src={sparkleImg}
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
              </>
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
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 text-center"
            >
              <div 
                className="bg-white rounded-lg px-4 py-2 shadow-lg mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleTap}
              >
                <span className="text-lg">Tap to Hold!</span>
              </div>
              <CircularCountdown
                duration={5}
                onComplete={handleCountdownComplete}
                isActive={isCountingDown}
                reset={countdownReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game instructions */}
      {gameStarted && !showTapPrompt && !gameEnded && (
        <div className="text-center text-gray-600">
          <p>Wait for the next price update...</p>
        </div>
      )}
    </motion.div>
  );
}