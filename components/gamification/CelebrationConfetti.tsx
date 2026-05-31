'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CelebrationProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  reward?: string;
  type?: 'achievement' | 'level_up' | 'streak' | 'milestone';
}

// Confetti particle component
function ConfettiParticle({ delay, duration }: { delay: number; duration: number }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 100 - 50;
  const randomRotate = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute top-0 left-1/2"
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: window.innerHeight,
        x: randomX,
        opacity: 0,
        rotate: randomRotate,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: randomColor }}
      />
    </motion.div>
  );
}

// Main celebration component
export function CelebrationConfetti({
  show,
  onClose,
  title,
  message,
  icon,
  reward,
  type = 'achievement',
}: CelebrationProps) {
  const [confettiCount] = useState(50);

  // Auto-close after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  // All celebration types use brand gradient - celebratory moments get brand treatment
  const getTypeIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="size-12 text-brand-orange" />;
      case 'level_up':
        return <Star className="size-12 text-brand-purple" />;
      case 'streak':
        return <Zap className="size-12 text-brand-orange" />;
      case 'milestone':
        return <Award className="size-12 text-brand-purple" />;
      default:
        return <Trophy className="size-12 text-brand-orange" />;
    }
  };

  // All celebrations use brand gradient
  const getTypeGradient = () => {
    return 'gradient-brand'; // Consistent brand celebration
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: confettiCount }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.02}
                duration={2 + Math.random() * 2}
              />
            ))}
          </div>

          {/* Celebration Card */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <Card className="relative max-w-md w-full overflow-hidden">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={onClose}
                >
                  <X className="size-4" />
                </Button>

                {/* Gradient header */}
                <div className={cn('p-8 bg-gradient-to-br', getTypeGradient())}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="flex justify-center mb-4"
                  >
                    {icon ? (
                      <div className="text-6xl">{icon}</div>
                    ) : (
                      getTypeIcon()
                    )}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white text-center mb-2"
                  >
                    {title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 text-center"
                  >
                    {message}
                  </motion.p>
                </div>

                {/* Reward section */}
                {reward && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 bg-muted/30"
                  >
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <span className="text-2xl">🎁</span>
                      <span className="font-semibold">{reward}</span>
                    </div>
                  </motion.div>
                )}

                {/* Action button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 bg-card"
                >
                  <Button
                    onClick={onClose}
                    variant="gradient"
                    className="w-full"
                  >
                    Awesome! 🎉
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage celebration queue
export function useCelebrationQueue() {
  const [queue, setQueue] = useState<CelebrationProps[]>([]);
  const [current, setCurrent] = useState<CelebrationProps | null>(null);

  const addCelebration = (celebration: Omit<CelebrationProps, 'show' | 'onClose'>) => {
    setQueue(prev => [...prev, { ...celebration, show: false, onClose: () => {} }]);
  };

  const showNext = () => {
    if (queue.length > 0 && !current) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);
    }
  };

  const closeCurrent = () => {
    setCurrent(null);
    // Show next after a short delay
    setTimeout(showNext, 500);
  };

  // Auto-show next celebration
  useEffect(() => {
    if (!current && queue.length > 0) {
      showNext();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- showNext is stable and doesn't need to be a dependency
  }, [current, queue]);

  return {
    addCelebration,
    currentCelebration: current ? { ...current, show: true, onClose: closeCurrent } : null,
  };
}
