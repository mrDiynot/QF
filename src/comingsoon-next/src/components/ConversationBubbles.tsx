'use client';

import { motion } from 'framer-motion';

export function ConversationBubbles() {
  return (
    <>
      {/* Customer Question - Bottom-left on mobile and desktop */}
      <div className="absolute bottom-4 left-1 md:left-6 max-w-[160px] sm:max-w-[200px] md:max-w-[300px] bg-gradient-to-br from-gray-700 to-gray-800 p-2 pl-8 md:p-4 md:pl-12 rounded-2xl rounded-bl-none shadow-xl border border-gray-600">
        <p className="text-xs font-medium text-white leading-loose">
          Hi I am interested in a photo shoot, do you have availabalility next month?
        </p>
        <div className="text-[10px] text-gray-300 mt-1 font-semibold">Customer</div>
      </div>

      {/* Customer Avatar - S in blue circle (overlapping bubble) - Bottom-left on mobile and desktop */}
      <div className="absolute bottom-4 left-0 md:left-6 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl border-2 border-white z-10">
        <span className="text-white font-bold text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>S</span>
      </div>
      
      {/* Wavy 3 dots animation - Centered on mobile, same position on desktop */}
      <motion.div 
        className="absolute top-[38%] right-2 md:right-6 -translate-y-1/2 flex items-center gap-1.5 z-30"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3.5 h-3.5 bg-purple-600 rounded-full border-[3px] border-white"
            animate={{
              y: [0, -6, 0],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              y: {
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.15,
              },
              opacity: {
                duration: 3,
                times: [0, 0.17, 0.83, 1],
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }
            }}
          />
        ))}
      </motion.div>

      {/* AI Response - Single Merged Bubble - Centered on mobile, positioned on desktop */}
      <motion.div
        className="absolute top-[54%] right-1 md:top-[58%] md:right-6 -translate-y-1/2 max-w-[200px] sm:max-w-[260px] md:max-w-[420px] bg-gradient-to-br from-[#6B2D9E] to-[#5B2486] p-2 md:p-5 rounded-2xl rounded-tr-none shadow-xl border border-purple-600 z-10"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0, 1, 1, 1, 0]
        }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 8,
          times: [0, 0.23, 0.27, 0.78, 0.82, 1],
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut"
        }}
      >

        <div className="space-y-1 md:space-y-3">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white leading-relaxed">
            Hi Sarah! Yes I have some great spots available in early February. What type of shoot are you thinking?
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white leading-relaxed">
            Portrait, family, or something else?
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white leading-relaxed">
            Check out my portfolio and packages here.
          </p>
        </div>
        <div className="text-[10px] md:text-xs text-purple-200 mt-2 md:mt-3 font-semibold">QualiFlow AI</div>
      </motion.div>
    </>
  );
}
