import { BadgeCheck, GlobeLock, LockKeyhole } from "lucide-react";

export function TrustBadges() {
  return (
    <div className="flex items-center gap-4 md:gap-6 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-white/90">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center border border-green-400/40 shadow-lg shadow-green-500/10">
          <BadgeCheck className="w-4 h-4 text-green-400" aria-hidden="true" strokeWidth={2.5} />
        </div>
        <span className="font-medium">SOC 2 Certified</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/90">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center border border-blue-400/40 shadow-lg shadow-blue-500/10">
          <GlobeLock className="w-4 h-4 text-blue-400" aria-hidden="true" strokeWidth={2.5} />
        </div>
        <span className="font-medium">GDPR Compliant</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/90">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center border border-purple-400/40 shadow-lg shadow-purple-500/10">
          <LockKeyhole className="w-4 h-4 text-purple-400" aria-hidden="true" strokeWidth={2.5} />
        </div>
        <span className="font-medium">256-bit Encryption</span>
      </div>
    </div>
  );
}
