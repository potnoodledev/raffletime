'use client';

import { Button } from './ui/button';
import { AnimatedDiamond } from './AnimatedDiamond';
import type { HomeScreenProps } from '@/types/minigame';

export function HomeScreen({ onStartDeposit, onShowTutorial, onShowHelp }: HomeScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        backgroundImage: `url(/minigame-assets/zoom-background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top section with title and caption */}
      <div className="text-center pt-2 pb-1">
        <div className="mb-1">
          <img
            src="/minigame-assets/title.png"
            alt="Diamond Hands"
            className="h-auto mx-auto object-contain"
            style={{ width: '416px', maxWidth: '90vw' }}
          />
        </div>
        <p className="text-black text-2xl sm:text-3xl mb-1 max-w-2xl italic px-4" style={{ fontFamily: "'Aubrey', cursive" }}>
          How long can you hold on to your diamond?
        </p>
      </div>

      {/* Center diamond section - this will take up the remaining space and center the diamond */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-64 h-64" style={{ marginTop: '-100px' }}>
          {/* Sparkle animations - positioned very close to and on top of diamond */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Sparkles directly on top of diamond */}
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-5 h-5 top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                animation: 'sparkle1 2s ease-in-out infinite',
                animationDelay: '0s'
              }}
            />
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-4 h-4 top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                animation: 'sparkle2 2.5s ease-in-out infinite',
                animationDelay: '0.3s'
              }}
            />

            {/* Sparkles very close to diamond edges */}
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-6 h-6 top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                animation: 'sparkle1 3s ease-in-out infinite',
                animationDelay: '0.6s'
              }}
            />
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-4 h-4 top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                animation: 'sparkle2 2.8s ease-in-out infinite',
                animationDelay: '0.9s'
              }}
            />

            {/* More sparkles on diamond surface */}
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-3 h-3 bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20"
              style={{
                animation: 'sparkle1 2.2s ease-in-out infinite',
                animationDelay: '1.2s'
              }}
            />
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-5 h-5 bottom-1/4 right-1/3 transform translate-x-1/2 translate-y-1/2 z-20"
              style={{
                animation: 'sparkle2 2.7s ease-in-out infinite',
                animationDelay: '1.5s'
              }}
            />

            {/* Additional sparkles for more glowing effect */}
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-4 h-4 top-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                animation: 'sparkle1 3.2s ease-in-out infinite',
                animationDelay: '1.8s'
              }}
            />
            <img
              src="/minigame-assets/sparkle.png"
              alt=""
              className="absolute w-3 h-3 bottom-1/6 left-1/3 transform -translate-x-1/2 translate-y-1/2 z-20"
              style={{
                animation: 'sparkle2 2.9s ease-in-out infinite',
                animationDelay: '2.1s'
              }}
            />
          </div>

          {/* Main diamond */}
          <AnimatedDiamond
            className="w-full h-full object-contain relative z-10"
            alt="Diamond"
            animationSpeed={1000}
          />
        </div>
      </div>

      {/* Bottom buttons section */}
      <div className="w-full max-w-sm space-y-4 pb-8" style={{ marginTop: '-40px' }}>
        <Button
          onClick={onStartDeposit}
          className="w-full py-4 text-lg bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          Deposit WLD to Play
        </Button>

        <Button
          onClick={onShowTutorial}
          variant="secondary"
          className="w-full py-4 text-lg"
          size="lg"
        >
          How to Play
        </Button>

        <Button
          onClick={onShowHelp}
          variant="outline"
          className="w-full py-3 text-base"
        >
          Help
        </Button>
      </div>
    </div>
  );
}