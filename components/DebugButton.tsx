"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DebugButton() {
  const pathname = usePathname();

  // Don't show on the debug page itself
  if (pathname === '/debug-wallet') {
    return null;
  }

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SHOW_DEBUG !== 'true') {
    return null;
  }

  return (
    <Link
      href="/debug-wallet"
      className="fixed bottom-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-full shadow-lg border-2 border-white font-mono transition-colors"
      title="Debug Wallet Auth"
    >
      🔍 DEBUG
    </Link>
  );
}