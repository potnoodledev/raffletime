import { useState, useEffect, useCallback, useRef } from 'react';
import { WalletConnection, WalletUser, WalletConnectionStatus, WalletError } from '@/types/wallet';
import { getMiniKit } from '@/lib/minikit';
import { generateMockWalletUser, simulateMockWalletAuth, MOCK_DELAYS } from '@/lib/mock/mock-wallet-data';

export interface UseWalletConnectionOptions {
  autoConnect?: boolean;
  onConnect?: (user: WalletUser) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
}

export interface UseWalletConnectionReturn {
  connection: WalletConnection | null;
  status: WalletConnectionStatus;
  user: WalletUser | null;
  error: WalletError | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
}

const STORAGE_KEY = 'worldWalletSession';

export function useWalletConnection(options: UseWalletConnectionOptions = {}): UseWalletConnectionReturn {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;

  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [status, setStatus] = useState<WalletConnectionStatus>('disconnected');
  const [user, setUser] = useState<WalletUser | null>(null);
  const [error, setError] = useState<WalletError | null>(null);
  const connectingRef = useRef(false);

  // Check if we're in mock mode
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  // Generate nonce for authentication
  const generateNonce = useCallback(() => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }, []);

  // Get stored session
  const getStoredSession = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to parse stored wallet session:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((walletAddress: string, sessionId: string, mockUserId?: string) => {
    const session = {
      walletAddress,
      sessionId,
      autoConnect: true,
      mockUserId: mockUserId || null,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  // Clear stored session
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check MiniKit availability
  const checkMiniKitAvailability = useCallback(async () => {
    if (isMockMode) {
      return true;
    }

    try {
      const MiniKit = await getMiniKit();
      return MiniKit?.isInstalled() || false;
    } catch (error) {
      return false;
    }
  }, [isMockMode]);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (connectingRef.current) {
      return;
    }

    try {
      connectingRef.current = true;
      setStatus('connecting');
      setError(null);

      // Check MiniKit availability
      const isAvailable = await checkMiniKitAvailability();
      if (!isAvailable) {
        throw new Error('MINIKIT_NOT_INSTALLED');
      }

      if (isMockMode) {
        // Mock mode connection
        const mockUserId = localStorage.getItem('mockUserId') || 'active-user';
        const mockUser = await simulateMockWalletAuth(mockUserId as any, {
          delay: MOCK_DELAYS.AUTH,
        });

        const newConnection: WalletConnection = {
          address: mockUser.address,
          isConnected: true,
          connectionTimestamp: Date.now(),
          lastRefreshTimestamp: Date.now(),
        };

        setConnection(newConnection);
        setUser(mockUser);
        setStatus('connected');

        // Save session
        const sessionId = `mock-session-${Date.now()}`;
        saveSession(mockUser.address, sessionId, mockUserId);

        onConnect?.(mockUser);
      } else {
        // Real MiniKit connection
        const MiniKit = await getMiniKit();
        const nonce = generateNonce();

        const walletAuthInput = {
          nonce,
          requestId: '0',
          expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement: 'Connect to RaffleTime Diamond Hands minigame',
        };

        const result = await MiniKit.commandsAsync.walletAuth(walletAuthInput);

        if (result && result.status === 'success') {
          const miniKitUser = MiniKit.user;
          if (!miniKitUser) {
            throw new Error('Failed to get user data');
          }

          const newConnection: WalletConnection = {
            address: miniKitUser.address,
            isConnected: true,
            connectionTimestamp: Date.now(),
            lastRefreshTimestamp: Date.now(),
          };

          setConnection(newConnection);
          setUser(miniKitUser);
          setStatus('connected');

          // Save session
          const sessionId = `session-${Date.now()}`;
          saveSession(miniKitUser.address, sessionId);

          onConnect?.(miniKitUser);
        } else {
          throw new Error('Authentication failed');
        }
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);

      let walletError: WalletError;

      if (err.message === 'MINIKIT_NOT_INSTALLED') {
        walletError = {
          code: 'MINIKIT_NOT_INSTALLED',
          message: 'World App is required to connect your wallet',
          details: { helpUrl: 'https://worldcoin.org/download' },
        };
      } else if (err.message.includes('denied') || err.message.includes('cancelled')) {
        walletError = {
          code: 'AUTH_FAILED',
          message: 'Connection was cancelled by user',
        };
      } else if (err.message.includes('network') || err.message.includes('timeout')) {
        walletError = {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection',
          details: { retry: true },
        };
      } else {
        walletError = {
          code: 'AUTH_FAILED',
          message: 'Failed to connect wallet. Please try again',
          details: { retry: true },
        };
      }

      setError(walletError);
      setStatus('error');
      onError?.(walletError);
    } finally {
      connectingRef.current = false;
    }
  }, [
    isMockMode,
    checkMiniKitAvailability,
    generateNonce,
    saveSession,
    onConnect,
    onError,
  ]);

  // Disconnect from wallet
  const disconnect = useCallback(() => {
    setConnection(null);
    setUser(null);
    setStatus('disconnected');
    setError(null);
    clearSession();
    onDisconnect?.();
  }, [clearSession, onDisconnect]);

  // Refresh connection
  const refresh = useCallback(async () => {
    if (!connection || !user) {
      return;
    }

    try {
      setError(null);

      if (isMockMode) {
        // Mock mode refresh
        const mockUserId = localStorage.getItem('mockUserId') || 'active-user';
        const mockUser = generateMockWalletUser(mockUserId as any);
        setUser(mockUser);
      } else {
        // Real MiniKit refresh
        const MiniKit = await getMiniKit();
        const currentUser = MiniKit.user;

        if (currentUser) {
          setUser(currentUser);
        } else {
          // User disconnected externally
          disconnect();
          return;
        }
      }

      // Update refresh timestamp
      setConnection(prev => prev ? {
        ...prev,
        lastRefreshTimestamp: Date.now(),
      } : null);
    } catch (err) {
      console.error('Failed to refresh wallet connection:', err);
      setError({
        code: 'NETWORK_ERROR',
        message: 'Failed to refresh connection',
        details: { retry: true },
      });
    }
  }, [connection, user, isMockMode, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    const session = getStoredSession();
    if (session && session.autoConnect && session.walletAddress) {
      // Check if session is recent (within 7 days)
      const sessionAge = Date.now() - (session.timestamp || 0);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (sessionAge < maxAge) {
        // Set mock user if in mock mode
        if (isMockMode && session.mockUserId) {
          localStorage.setItem('mockUserId', session.mockUserId);
        }

        // Attempt auto-connect
        connect().catch(() => {
          // Auto-connect failed, clear invalid session
          clearSession();
        });
      } else {
        // Session expired
        clearSession();
      }
    }
  }, [autoConnect, connect, getStoredSession, clearSession, isMockMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectingRef.current = false;
    };
  }, []);

  return {
    connection,
    status,
    user,
    error,
    connect,
    disconnect,
    refresh,
    isConnecting: status === 'connecting',
    isConnected: status === 'connected',
  };
}