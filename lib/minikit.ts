/**
 * Unified MiniKit Interface
 * Automatically switches between real and mock MiniKit based on environment
 */

import { WalletAuthInput } from "@worldcoin/minikit-js";
import { isMockModeEnabled } from "./mock/environment";

// Type-safe interface that matches both real and mock MiniKit
interface UnifiedMiniKit {
  isInstalled(): boolean;
  user: any;
  commandsAsync: {
    walletAuth(input: WalletAuthInput): Promise<any>;
    pay(payload: any): Promise<any>;
    verify(payload: any): Promise<any>;
  };
}

let miniKitInstance: UnifiedMiniKit;

// Initialize the appropriate MiniKit instance
const initializeMiniKit = (): UnifiedMiniKit => {
  if (isMockModeEnabled()) {
    // Use mock MiniKit in development
    const { MockMiniKitInstance } = require("./mock/mock-minikit");
    console.log("🧪 Using Mock MiniKit");
    return MockMiniKitInstance;
  } else {
    // Use real MiniKit in production
    const { MiniKit: RealMiniKit } = require("@worldcoin/minikit-js");
    console.log("✅ Using Real MiniKit");
    return RealMiniKit;
  }
};

// Lazy initialization to avoid issues with SSR
const getMiniKit = (): UnifiedMiniKit => {
  if (!miniKitInstance) {
    miniKitInstance = initializeMiniKit();
  }
  return miniKitInstance;
};

// Export unified interface
export const MiniKit = {
  get isInstalled() {
    return getMiniKit().isInstalled;
  },

  get user() {
    return getMiniKit().user;
  },

  get commandsAsync() {
    return getMiniKit().commandsAsync;
  },

  install: () => {
    const kit = getMiniKit();
    if ('install' in kit) {
      (kit as any).install();
    }
  }
};

// Export getMiniKit for direct access in hooks
export { getMiniKit };

// Re-export types for convenience
export type { WalletAuthInput } from "@worldcoin/minikit-js";