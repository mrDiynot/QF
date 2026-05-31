'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const videoPlaceholder = 'https://images.pexels.com/photos/10020092/pexels-photo-10020092.jpeg';

function ModernVideoPlayer({ poster, className = '' }: { poster?: string; className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particlePositions, setParticlePositions] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParticlePositions([...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    })));
    setMounted(true);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 p-[2px]">
        <div className="relative rounded-[14px] overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-40"
            poster={poster}
            onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
            onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
            onClick={togglePlay}
          >
            Your browser does not support the video tag.
          </video>

          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-transparent to-orange-600/40 pointer-events-none" />

          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60"
              >
                {mounted && (
                  <div className="absolute inset-0 overflow-hidden">
                    {particlePositions.map((p, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{ left: `${p.left}%`, top: `${p.top}%` }}
                        animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl px-4 sm:px-8">
                  <motion.button
                    onClick={togglePlay}
                    className="relative mb-4 sm:mb-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-orange-600 blur-2xl opacity-50" />
                    <div className="relative w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center shadow-2xl">
                      <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-purple-500 to-orange-500" />
                      <Play className="relative w-5 h-5 sm:w-10 sm:h-10 text-white ml-0.5 sm:ml-1 drop-shadow-lg" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.button>

                  <div className="text-center">
                    <h3 className="text-sm sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent whitespace-nowrap">
                      Demo Coming Soon
                    </h3>
                    <p className="text-white/80 text-xs sm:text-lg md:text-xl leading-relaxed max-w-xl hidden sm:block">
                      See how Qualiflow AI captures, qualifies, and converts leads automatically
                    </p>
                  </div>
                </div>

                <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                  </div>
                  <div className="px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                    <span className="text-[10px] sm:text-xs font-semibold text-white/90">Coming Soon</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: showControls || !isPlaying ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl"
          >
            <div className="px-4 pt-4">
              <div className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer" onClick={handleProgressClick}>
                <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full" style={{ width: `${progressPercentage}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => skip(-10)} className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 hover:text-white rounded-lg">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={togglePlay} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-orange-600 rounded-lg">
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
                </button>
                <button onClick={() => skip(10)} className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 hover:text-white rounded-lg">
                  <SkipForward className="w-4 h-4" />
                </button>
                <div className="hidden sm:block ml-2 text-white/70 text-sm tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={toggleMute} className="w-9 h-9 flex items-center justify-center text-white/80 rounded-lg">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (videoRef.current) videoRef.current.volume = v; setVolume(v); setIsMuted(v === 0); }}
                    className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <button className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 rounded-lg">
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={toggleFullscreen} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 rounded-lg">
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ProductPreviewSection() {
  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-orange-100/30 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full mb-2">
            <span className="text-sm font-semibold text-[#6B2D9E]">See It In Action</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
            The AI Powered Customer Journey Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Qualiflow AI turns your leads into revenue automatically. Captures, qualifies, books, follows up, collects reviews, and re-engages.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div id="demo-video" className="mb-8 flex justify-center">
            <div className="bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] rounded-3xl p-3 w-full max-w-4xl shadow-2xl shadow-purple-500/20">
              <ModernVideoPlayer className="h-[280px] sm:h-[380px] md:h-[500px]" poster={videoPlaceholder} />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="text-center mt-12">
          <button
            onClick={() => {
              const el = document.getElementById('demo-video');
              if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); const v = el.querySelector('video'); if (v) v.play().catch(() => {}); }
            }}
            className="relative px-8 py-4 bg-gradient-to-r from-[#FF5722] to-[#FF6D3F] text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
          >
            Watch Demo
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ProductPreviewSection;
