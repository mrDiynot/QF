import Image from 'next/image';

interface UpgradeBadgeProps {
  planName?: string;
}

export function UpgradeBadge({ planName }: UpgradeBadgeProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-[#AD46FF] px-3 py-1">
      <Image
        src="/icons/upgrade-badge.svg"
        alt=""
        width={12}
        height={12}
      />
      <span className="tiny-text font-normal text-white">
        {planName || 'Upgrade'}
      </span>
    </div>
  );
}