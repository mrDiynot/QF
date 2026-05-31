'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface WaitlistCounterProps {
  baseCount?: number;
  className?: string;
}

/** Ease-out cubic */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function WaitlistCounter({ baseCount = 1247, className = '' }: WaitlistCounterProps) {
  // Start at 0 on the server; after mount animate up to baseCount
  const [displayCount, setDisplayCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Animate counter from 0 → baseCount on mount
  useEffect(() => {
    setMounted(true);
    const DURATION = 1800; // ms
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      setDisplayCount(Math.round(easeOutCubic(progress) * baseCount));
      if (progress < 1) requestAnimationFrame(frame);
    };

    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [baseCount]);

  // Simulate occasional signups for realism (client only)
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setDisplayCount((prev) => prev + 1);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full blur-lg" />
        <div className="relative flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
          <div className="flex -space-x-2">
            <Image src="https://i.pravatar.cc/24?u=user1" alt="User" width={24} height={24} unoptimized className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
            <Image src="https://i.pravatar.cc/24?u=user2" alt="User" width={24} height={24} unoptimized className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
            <Image src="https://i.pravatar.cc/24?u=user3" alt="User" width={24} height={24} unoptimized className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="font-bold tabular-nums" suppressHydrationWarning>
              {displayCount.toLocaleString()}
            </span>
            <span className="text-white/80 text-sm">on the waitlist</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WaitlistCounterDark({ baseCount = 1247, className = '' }: WaitlistCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const DURATION = 1800;
    const startTime = performance.now();
    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      setDisplayCount(Math.round(easeOutCubic(progress) * baseCount));
      if (progress < 1) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [baseCount]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) setDisplayCount((prev) => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        <Image src="https://i.pravatar.cc/28?u=user4" alt="User" width={28} height={28} unoptimized className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" />
        <Image src="https://i.pravatar.cc/28?u=user5" alt="User" width={28} height={28} unoptimized className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" />
        <Image src="https://i.pravatar.cc/28?u=user6" alt="User" width={28} height={28} unoptimized className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" />
        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-800">+</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[#6B2D9E] font-semibold">Join</span>
        <span className="font-bold text-gray-900 tabular-nums" suppressHydrationWarning>
          {displayCount.toLocaleString()}
        </span>
        <span className="text-gray-600">others</span>
      </div>
    </div>
  );
}
