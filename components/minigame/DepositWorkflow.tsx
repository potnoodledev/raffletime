'use client';

import { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
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

// Remove the problematic memoized component - use WalletConnection directly
// The memoization was preventing balance updates from showing

export function DepositWorkflow({ onComplete, onBack }: DepositWorkflowProps) {
  const [depositAmount, setDepositAmount] = useState('1.0');
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


  // Track wallet state changes to detect unwanted changes
  const prevWalletState = useRef({ isConnected, user, balance });
  useEffect(() => {
    const prev = prevWalletState.current;
    if (prev.isConnected !== isConnected || prev.user !== user || prev.balance !== balance) {
      console.log('🔍 [DepositWorkflow] Wallet state changed:', {
        previous: prev,
        current: { isConnected, user, balance },
        changes: {
          connectionChanged: prev.isConnected !== isConnected,
          userChanged: prev.user !== user,
          balanceChanged: prev.balance !== balance
        }
      });
      prevWalletState.current = { isConnected, user, balance };
    }
  }, [isConnected, user, balance]);

  // Debug wallet connection status (only when wallet state changes)
  // Clear any cached balance on mount to ensure fresh data
  useEffect(() => {
    // Clear wallet balance cache to get fresh balance data
    const cacheKey = `wallet_balance_${user?.address || 'unknown'}`;
    localStorage.removeItem(cacheKey);
    console.log('🔍 [DepositWorkflow] Cleared wallet balance cache for fresh data');
  }, []); // Only run on mount

  // Force balance refresh when wallet connects
  useEffect(() => {
    if (isConnected && user && refreshBalance) {
      console.log('🔍 [DepositWorkflow] Wallet connected, triggering balance refresh');
      refreshBalance();
    }
  }, [isConnected, user, refreshBalance]); // Run when wallet connects

  // Debug wallet connection status (only when wallet state changes)
  useEffect(() => {
    console.log('🔍 [DepositWorkflow] Wallet status:', {
      isConnected,
      user: user ? {
        address: user.address,
        username: user.username,
        profilePicture: user.profilePicture
      } : null,
      walletError: walletError ? {
        code: walletError.code,
        message: walletError.message
      } : null,
      balance: balance ? {
        amount: balance.amount,
        amountType: typeof balance.amount,
        formatted: balance.formatted,
        error: balance.error,
        isLoading: balance.isLoading,
        lastUpdated: balance.lastUpdated,
        // Debug: full balance object
        fullObject: balance
      } : 'BALANCE_IS_NULL',
      balanceLoading,
      // Additional debugging for comparison with WalletConnection component
      hookCallComparison: 'DepositWorkflow vs WalletConnection - same useWalletConnection hook'
    });

    // Also debug the balance separately for clarity
    if (balance) {
      console.log('🔍 [DepositWorkflow] Balance object details:', {
        rawBalance: balance,
        amountValue: balance.amount,
        amountType: typeof balance.amount,
        isValidNumber: !isNaN(balance.amount),
        formatted: balance.formatted,
        isLoading: balance.isLoading,
        hasError: !!balance.error
      });
    } else {
      console.log('🔍 [DepositWorkflow] Balance is NULL - balance not loaded yet');
    }
  }, [isConnected, user, walletError, balance, balanceLoading]);

  const handleAmountInput = useCallback((value: string) => {
    console.log('🔍 [DepositWorkflow] Amount input changed:', value);
    setDepositAmount(value);
  }, []);

  // Enhanced validation logic (memoized to prevent unnecessary recalculations)
  const validation = useMemo(() => {
    const amount = parseFloat(depositAmount);

    console.log('🔍 [DepositWorkflow] validateDeposit called with:', {
      amount,
      depositAmount,
      isConnected,
      balance,
      balanceLoading
    });

    if (!isConnected) {
      console.log('🔍 [DepositWorkflow] Validation failed: not connected');
      return { isValid: false, error: 'Please connect your wallet first' };
    }

    if (isNaN(amount) || amount <= 0) {
      console.log('🔍 [DepositWorkflow] Validation failed: invalid amount');
      return { isValid: false, error: 'Please enter a valid amount' };
    }

    if (amount < GAME_CONSTANTS.MIN_PRICE) {
      console.log('🔍 [DepositWorkflow] Validation failed: amount too low');
      return { isValid: false, error: `Minimum amount is ${GAME_CONSTANTS.MIN_PRICE} WLD` };
    }

    if (!balance) {
      console.log('🔍 [DepositWorkflow] Validation failed: no balance loaded');
      return { isValid: false, error: 'Unable to load balance. Please refresh.' };
    }

    if (balance.error) {
      console.log('🔍 [DepositWorkflow] Validation failed: balance error:', balance.error);
      return { isValid: false, error: 'Error loading balance. Please try again.' };
    }

    if (!hasSufficientBalance(balance, amount)) {
      console.log('🔍 [DepositWorkflow] Validation failed: insufficient balance');
      return {
        isValid: false,
        error: `Insufficient balance. You have ${formatBalance(balance.amount, 4)} but need ${formatBalance(amount, 4)}`
      };
    }

    console.log('🔍 [DepositWorkflow] Validation passed!');
    return { isValid: true, error: null };
  }, [depositAmount, isConnected, balance, balanceLoading]);

  const handleComplete = async () => {
    console.log('🔍 [DepositWorkflow] handleComplete called');
    console.log('🔍 [DepositWorkflow] depositAmount:', depositAmount);
    console.log('🔍 [DepositWorkflow] isConnected:', isConnected);
    console.log('🔍 [DepositWorkflow] user:', user);
    console.log('🔍 [DepositWorkflow] balance:', balance);

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

  // Memoized computed values to prevent unnecessary recalculations
  const computedValues = useMemo(() => {
    const currentAmount = parseFloat(depositAmount);
    const isValidAmount = currentAmount >= GAME_CONSTANTS.MIN_PRICE && !isNaN(currentAmount);
    const hasSufficientFunds = balance ? hasSufficientBalance(balance, currentAmount) : false;
    const canProceed = validation.isValid && !isProcessing;

    return {
      currentAmount,
      isValidAmount,
      hasSufficientFunds,
      canProceed,
      buttonDisabled: !canProceed || balanceLoading
    };
  }, [depositAmount, balance, validation.isValid, isProcessing, balanceLoading]);

  // Debug the computed values (only when they change)
  useEffect(() => {
    console.log('🔍 [DepositWorkflow] Computed values:', {
      ...computedValues,
      validation,
      isProcessing,
      // Additional debug info for button state
      buttonDisabledReason: {
        canProceedFalse: !computedValues.canProceed,
        balanceLoading: balanceLoading,
        validationInvalid: !validation.isValid,
        isProcessingTrue: isProcessing
      }
    });
  }, [computedValues, validation, isProcessing, balanceLoading]);

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

              {/* Mock mode indicator */}
              {(!user || user.address?.startsWith('0xmock')) && isConnected && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  <div className="flex items-center gap-2">
                    <span>🧪</span>
                    <span>Demo Mode: Playing with mock wallet for demonstration</span>
                  </div>
                </div>
              )}

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

            {/* Deposit amount */}
            <div className="text-left mb-8">
              <Label htmlFor="deposit-amount" className="mb-2 block text-gray-700">
                Enter deposit amount (WLD)
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => handleAmountInput(e.target.value)}
                min={GAME_CONSTANTS.MIN_PRICE}
                step="0.0001"
                className="text-center text-lg py-3 text-black"
                placeholder="Enter amount"
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum: {GAME_CONSTANTS.MIN_PRICE} WLD
              </p>
            </div>

            {/* Current selection */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-semibold">
                Starting with: {computedValues.currentAmount} WLD
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
              disabled={computedValues.buttonDisabled}
            >
              {(() => {
                console.log('🔍 [DepositWorkflow] Button render logic - DETAILED:', {
                  isProcessing,
                  balanceLoading,
                  isConnected,
                  validationMessage,
                  canProceed: computedValues.canProceed,
                  currentAmount: computedValues.currentAmount,
                  isMockMode,
                  validation,
                  // Detailed breakdown
                  checks: {
                    '1_isProcessing': isProcessing,
                    '2_balanceLoading': balanceLoading,
                    '3_isConnected': isConnected,
                    '4_validationMessageType': validationMessage?.type,
                    '5_canProceed': computedValues.canProceed,
                    '6_validationIsValid': validation.isValid,
                    '7_validationError': validation.error
                  }
                });

                if (isProcessing) {
                  console.log('🔍 [DepositWorkflow] → Branch: isProcessing');
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isMockMode ? 'Processing Mock Transaction...' : 'Processing...'}
                    </div>
                  );
                }

                if (balanceLoading) {
                  console.log('🔍 [DepositWorkflow] → Branch: balanceLoading');
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Loading Balance...
                    </div>
                  );
                }

                if (!isConnected) {
                  console.log('🔍 [DepositWorkflow] → Branch: !isConnected');
                  return 'Connect Wallet First';
                }

                if (validationMessage?.type === 'error') {
                  console.log('🔍 [DepositWorkflow] → Branch: validation error:', validationMessage.text);
                  return validationMessage.text.includes('Insufficient') ? 'Insufficient Balance' :
                         validationMessage.text.includes('Minimum') ? 'Amount Too Low' :
                         validationMessage.text.includes('valid') ? 'Invalid Amount' :
                         'Cannot Proceed';
                }

                if (computedValues.canProceed) {
                  console.log('🔍 [DepositWorkflow] → Branch: canProceed - SUCCESS!');
                  return isMockMode ? `🧪 Mock Deposit ${computedValues.currentAmount} WLD` : `Start Game with ${computedValues.currentAmount} WLD`;
                }

                console.log('🔍 [DepositWorkflow] → Branch: default "Enter Amount"');
                console.log('🔍 [DepositWorkflow] → WHY: canProceed =', computedValues.canProceed, 'validation.isValid =', validation.isValid, 'isProcessing =', isProcessing);
                return 'Enter Amount';
              })()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}