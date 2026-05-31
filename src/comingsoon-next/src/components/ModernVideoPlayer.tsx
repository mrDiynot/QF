"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModernVideoPlayerProps {
  poster?: string;
  className?: string;
}

export function ModernVideoPlayer({ poster, className = "" }: ModernVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate stable random values after mount to avoid hydration mismatch
  const [particlePositions, setParticlePositions] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Initialize particles only on client
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-side initialization
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
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
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

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
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
      onMouseEnter={() => {
        setShowControls(true);
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setShowControls(isPlaying ? false : true);
        setIsHovering(false);
      }}
    >
      {/* Modern container with gradient border */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 p-[2px]">
        <div className="relative rounded-[14px] overflow-hidden bg-black">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-40"
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          >
            Your browser does not support the video tag.
          </video>

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-transparent to-orange-600/40 pointer-events-none" />

          {/* Center Play Button Overlay */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60"
              >
                {/* Floating particles effect - only render after mount to avoid hydration mismatch */}
                {mounted && (
                  <div className="absolute inset-0 overflow-hidden">
                    {particlePositions.map((particle, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                          left: `${particle.left}%`,
                          top: `${particle.top}%`,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: particle.duration,
                          repeat: Infinity,
                          delay: particle.delay,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl px-4 sm:px-8">
                  {/* Large modern play button */}
                  <motion.button
                    onClick={togglePlay}
                    className="relative mb-4 sm:mb-8 group/play"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-orange-600 blur-2xl opacity-50 group-hover/play:opacity-75 transition-opacity" />
                    
                    {/* Button */}
                    <div className="relative w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center shadow-2xl">
                      <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-purple-500 to-orange-500" />
                      <Play className="relative w-5 h-5 sm:w-10 sm:h-10 text-white ml-0.5 sm:ml-1 drop-shadow-lg" />
                    </div>
                    
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  </motion.button>
                  
                  {/* Text content */}
                  <div className="text-center">
                    <h3 className="text-sm sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent whitespace-nowrap">
                      Demo Coming Soon
                    </h3>
                    <p className="text-white/80 text-xs sm:text-lg md:text-xl leading-relaxed max-w-xl hidden sm:block">
                      See how QualiflowAI captures, qualifies, and converts leads automatically
                    </p>
                  </div>
                </div>

                {/* Top bar badges */}
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

          {/* Modern Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showControls || !isPlaying ? 1 : 0,
              y: showControls || !isPlaying ? 0 : 20
            }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl"
          >
            {/* Progress Bar */}
            <div className="px-4 pt-4">
              <div
                className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer group/progress"
                onClick={handleProgressClick}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full relative"
                  style={{ width: `${progressPercentage}%` }}
                  whileHover={{ height: '6px' }}
                >
                  <motion.div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                    whileHover={{ scale: 1.5 }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2">
                {/* Skip Back - Hidden on mobile */}
                <motion.button
                  onClick={() => skip(-10)}
                  className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipBack className="w-4 h-4" />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-orange-600 rounded-lg hover:from-purple-500 hover:to-orange-500 transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
                </motion.button>

                {/* Skip Forward - Hidden on mobile */}
                <motion.button
                  onClick={() => skip(10)}
                  className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipForward className="w-4 h-4" />
                </motion.button>

                {/* Time Display - Hidden on mobile */}
                <div className="hidden sm:block ml-2 text-white/70 text-sm font-medium tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Volume Controls - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2 group/volume">
                  <motion.button
                    onClick={toggleMute}
                    className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </motion.button>
                  <motion.input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    initial={{ width: 0, opacity: 0 }}
                    whileHover={{ width: 80, opacity: 1 }}
                    className="h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>

                {/* Settings - Hidden on mobile */}
                <motion.button
                  className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4" />
                </motion.button>

                {/* Fullscreen */}
                <motion.button
                  onClick={toggleFullscreen}
                  className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
