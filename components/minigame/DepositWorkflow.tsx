'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { WalletConnection } from '@/components/WalletConnection';
import { MiniKitDebugger } from '@/components/WalletConnection/MiniKitDebugger';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import { useWalletBalance } from '@/lib/hooks/useWalletBalance';
import { useMockMode } from '@/lib/hooks/useMockMode';
import { hasSufficientBalance, formatBalance } from '@/lib/utils/wallet';
import { simulateMinigameDeposit } from '@/lib/mock/mock-wallet-operations';
import type { DepositWorkflowProps } from '@/types/minigame';
import { GAME_CONSTANTS } from '@/types/minigame';

export function DepositWorkflow({ onComplete, onBack }: DepositWorkflowProps) {
  const [depositAmount, setDepositAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Wallet integration
  const { isConnected, user, connect, error: walletError } = useWalletConnection({
    autoConnect: true,
  });
  const { balance, isLoading: balanceLoading, refresh: refreshBalance } = useWalletBalance({
    user,
    autoFetch: isConnected,
  });
  const { isMockMode, mockUser } = useMockMode();

  // Debug wallet connection status
  console.log('🔍 [DepositWorkflow] Wallet status:', {
    isConnected,
    user,
    walletError,
    balance,
    balanceLoading
  });

  const handlePresetAmount = (amount: number) => {
    setDepositAmount(amount.toString());
    setIsCustom(false);
  };

  const handleCustomInput = (value: string) => {
    setCustomAmount(value);
    setDepositAmount(value);
    setIsCustom(true);
  };

  // Enhanced validation logic
  const validateDeposit = () => {
    const amount = parseFloat(depositAmount);

    if (!isConnected) {
      return { isValid: false, error: 'Please connect your wallet first' };
    }

    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: 'Please enter a valid amount' };
    }

    if (amount < GAME_CONSTANTS.MIN_PRICE) {
      return { isValid: false, error: `Minimum amount is ${GAME_CONSTANTS.MIN_PRICE} WLD` };
    }

    if (!balance) {
      return { isValid: false, error: 'Unable to load balance. Please refresh.' };
    }

    if (balance.error) {
      return { isValid: false, error: 'Error loading balance. Please try again.' };
    }

    if (!hasSufficientBalance(balance, amount)) {
      return {
        isValid: false,
        error: `Insufficient balance. You have ${formatBalance(balance.amount, 4)} but need ${formatBalance(amount, 4)}`
      };
    }

    return { isValid: true, error: null };
  };

  const handleComplete = async () => {
    console.log('🔍 [DepositWorkflow] handleComplete called');
    console.log('🔍 [DepositWorkflow] depositAmount:', depositAmount);
    console.log('🔍 [DepositWorkflow] isConnected:', isConnected);
    console.log('🔍 [DepositWorkflow] user:', user);
    console.log('🔍 [DepositWorkflow] balance:', balance);

    const validation = validateDeposit();
    console.log('🔍 [DepositWorkflow] validation result:', validation);

    if (!validation.isValid || isProcessing) {
      console.log('🔍 [DepositWorkflow] Validation failed or already processing, returning');
      return;
    }

    const amount = parseFloat(depositAmount);
    console.log('🔍 [DepositWorkflow] Parsed amount:', amount);

    try {
      console.log('🔍 [DepositWorkflow] Setting isProcessing to true');
      setIsProcessing(true);

      if (isMockMode && mockUser) {
        // Simulate mock transaction
        console.log(`Simulating ${amount} WLD deposit for ${mockUser.persona}`);

        const result = await simulateMinigameDeposit(mockUser.persona, amount);

        if (result.success) {
          console.log('Mock deposit successful:', result);
          // Refresh balance to reflect changes
          await refreshBalance();
          // Complete the workflow
          onComplete(amount);
        } else {
          console.error('Mock deposit failed:', result.error);
          // In a real app, you'd show the error to the user
          // For now, we'll still proceed to keep the demo flowing
          onComplete(amount);
        }
      } else {
        // Real wallet transaction would go here
        // For now, just proceed with the game
        onComplete(amount);
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      // In a real app, show error to user
      // For demo purposes, proceed anyway
      onComplete(amount);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentAmount = parseFloat(depositAmount);
  const validation = validateDeposit();
  const isValidAmount = currentAmount >= GAME_CONSTANTS.MIN_PRICE && !isNaN(currentAmount);
  const hasSufficientFunds = balance ? hasSufficientBalance(balance, currentAmount) : false;
  const canProceed = validation.isValid && !isProcessing;

  // Get validation message for display
  const getValidationMessage = () => {
    if (!validation.error) return null;

    // Determine message type
    const isWarning = validation.error.includes('Minimum') || validation.error.includes('valid amount');
    const isError = !isConnected || validation.error.includes('Insufficient') || validation.error.includes('Error');

    return {
      text: validation.error,
      type: isError ? 'error' : isWarning ? 'warning' : 'info'
    };
  };

  const validationMessage = getValidationMessage();

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
            <p className="text-gray-600 mb-6">
              Select how much WLD you want to start with. This is just for fun - no real money involved!
            </p>

            {/* Wallet Connection */}
            <div className="mb-6">
              <WalletConnection
                showBalance={true}
                compact={false}
                onConnect={() => {}}
                onDisconnect={() => {}}
                onError={(error) => console.error('Wallet error:', error)}
                className="mb-4"
              />

              {/* Wallet status messages */}
              {!isConnected && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  Connect your wallet to see your balance and start playing
                </div>
              )}

              {/* Enhanced validation messages */}
              {validationMessage && (
                <div className={`p-3 border rounded-lg text-sm ${
                  validationMessage.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : validationMessage.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">
                      {validationMessage.type === 'error' ? '❌' :
                       validationMessage.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span>{validationMessage.text}</span>
                  </div>
                </div>
              )}

              {/* Wallet connection error */}
              {walletError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">🔗</span>
                    <span>Wallet Error: {walletError.message}</span>
                  </div>
                </div>
              )}

              {/* Balance loading indicator */}
              {isConnected && balanceLoading && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>Loading your balance...</span>
                  </div>
                </div>
              )}

              {/* MiniKit Debugger for development */}
              {process.env.NODE_ENV === 'development' && !isMockMode && walletError && (
                <MiniKitDebugger className="mb-4" />
              )}
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {GAME_CONSTANTS.PRESET_DEPOSITS.map((amount) => {
                const hasEnoughForAmount = balance ? hasSufficientBalance(balance, amount) : true;
                const isSelected = depositAmount === amount.toString() && !isCustom;

                return (
                  <Button
                    key={amount}
                    onClick={() => handlePresetAmount(amount)}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`py-4 text-lg relative ${
                      !hasEnoughForAmount && isConnected && balance && !balance.isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!hasEnoughForAmount && isConnected && balance && !balance.isLoading}
                  >
                    <div className="flex flex-col items-center">
                      <span>{amount} WLD</span>
                      {!hasEnoughForAmount && isConnected && balance && !balance.isLoading && (
                        <span className="text-xs text-red-500 mt-1">
                          Insufficient
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
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
              disabled={!canProceed || balanceLoading}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isMockMode ? 'Processing Mock Transaction...' : 'Processing...'}
                </div>
              ) : balanceLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Loading Balance...
                </div>
              ) : !isConnected ? (
                'Connect Wallet First'
              ) : validationMessage?.type === 'error' ? (
                validationMessage.text.includes('Insufficient') ? 'Insufficient Balance' :
                validationMessage.text.includes('Minimum') ? 'Amount Too Low' :
                validationMessage.text.includes('valid') ? 'Invalid Amount' :
                'Cannot Proceed'
              ) : canProceed ? (
                isMockMode ? `🧪 Mock Deposit ${currentAmount} WLD` : `Start Game with ${currentAmount} WLD`
              ) : (
                'Enter Amount'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}