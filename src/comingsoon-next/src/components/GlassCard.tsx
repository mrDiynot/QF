interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-xl bg-white/95 border border-white/20 rounded-2xl shadow-2xl ${className}`}>
      {children}
    </div>
  );
}
