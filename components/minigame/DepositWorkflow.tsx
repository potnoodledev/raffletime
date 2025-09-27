'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { DepositWorkflowProps } from '@/types/minigame';
import { GAME_CONSTANTS } from '@/types/minigame';

export function DepositWorkflow({ onComplete, onBack }: DepositWorkflowProps) {
  const [depositAmount, setDepositAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetAmount = (amount: number) => {
    setDepositAmount(amount.toString());
    setIsCustom(false);
  };

  const handleCustomInput = (value: string) => {
    setCustomAmount(value);
    setDepositAmount(value);
    setIsCustom(true);
  };

  const handleComplete = () => {
    const amount = parseFloat(depositAmount);
    if (amount >= GAME_CONSTANTS.MIN_PRICE) {
      onComplete(amount);
    }
  };

  const currentAmount = parseFloat(depositAmount);
  const isValidAmount = currentAmount >= GAME_CONSTANTS.MIN_PRICE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col p-6">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <span className="text-sm text-gray-600">Choose Amount</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Choose Your Deposit</h2>
            <p className="text-gray-600 mb-8">
              Select how much WLD you want to start with. This is just for fun - no real money involved!
            </p>

            {/* Preset amounts */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {GAME_CONSTANTS.PRESET_DEPOSITS.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handlePresetAmount(amount)}
                  variant={depositAmount === amount.toString() && !isCustom ? 'default' : 'outline'}
                  className="py-4 text-lg"
                >
                  {amount} WLD
                </Button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="text-left mb-8">
              <Label htmlFor="custom-amount" className="mb-2 block text-gray-700">
                Or enter custom amount
              </Label>
              <Input
                id="custom-amount"
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomInput(e.target.value)}
                min={GAME_CONSTANTS.MIN_PRICE}
                step="0.0001"
                className="text-center text-lg py-3"
                placeholder="Enter amount"
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum: {GAME_CONSTANTS.MIN_PRICE} WLD
              </p>
            </div>

            {/* Current selection */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-semibold">
                Starting with: {currentAmount} WLD
              </p>
            </div>

            {/* Warning */}
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <p className="text-yellow-800 mb-2">
                <strong>Remember:</strong>
              </p>
              <p className="text-yellow-700 text-sm">
                Your diamond's price will change every 5 seconds. Tap the screen to hold on - if you don't tap in time, you'll sell automatically!
              </p>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full py-3 text-lg"
              disabled={!isValidAmount}
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}