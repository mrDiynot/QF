'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const VIDEO_SRC = '/audio/Video 2026-04-13 at 14.05.19.mp4';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOpen) {
      video.currentTime = 0;
      video.muted = false;
      video.play().catch(() => {
        // Browser may block unmuted autoplay; fall back to muted
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[190vw] w-[190vw] p-0 bg-black border-white/10 rounded-2xl overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        <VisuallyHidden>
          <DialogTitle>Demo Video</DialogTitle>
        </VisuallyHidden>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          loop
          playsInline
          controls
          className="w-full h-auto max-h-[90vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
