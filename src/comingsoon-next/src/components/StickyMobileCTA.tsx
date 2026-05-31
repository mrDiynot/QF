'use client';

interface StickyMobileCTAProps {
  onClick: () => void;
}

export function StickyMobileCTA({ onClick }: StickyMobileCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl lg:hidden z-50">
      <button
        onClick={onClick}
        className="w-full h-14 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
        aria-label="Get early access to QualiflowAI"
      >
        Get Early Access
      </button>
    </div>
  );
}
