'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';


interface WaitlistCounterProps {
  baseCount?: number;
  className?: string;
}

export function WaitlistCounter({ baseCount = 1247, className = '' }: WaitlistCounterProps) {
  const [count, setCount] = useState(baseCount);
  
  // Animate the number
  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(count);
  }, [count, spring]);

  // Simulate occasional signups for realism
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount((prev) => prev + 1);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full blur-lg" />
        <div className="relative flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
          <div className="flex -space-x-2">
            {/* Avatar stack with images */}
            <Image src="https://i.pravatar.cc/24?u=user1" alt="User" width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
            <Image src="https://i.pravatar.cc/24?u=user2" alt="User" width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
            <Image src="https://i.pravatar.cc/24?u=user3" alt="User" width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <motion.span className="font-bold tabular-nums" suppressHydrationWarning>{display}</motion.span>
            <span className="text-white/80 text-sm">on the waitlist</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WaitlistCounterDark({ baseCount = 1247, className = '' }: WaitlistCounterProps) {
  const [count, setCount] = useState(baseCount);
  
  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(count);
  }, [count, spring]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount((prev) => prev + 1);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        <Image src="https://i.pravatar.cc/28?u=user4" alt="User" width={28} height={28} className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" />
        <Image src="https://i.pravatar.cc/28?u=user5" alt="User" width={28} height={28} className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" />
        <Image src="https://i.pravatar.cc/28?u=user6" alt="User" width={28} height={28} className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" />
        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-800">+</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[#6B2D9E] font-semibold">Join</span>
        <motion.span className="font-bold text-gray-900 tabular-nums" suppressHydrationWarning>{display}</motion.span>
        <span className="text-gray-600">others</span>
      </div>
    </div>
  );
}
