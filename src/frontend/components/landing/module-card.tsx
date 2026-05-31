import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  channels?: string[];
}

export function ModuleCard({ icon: Icon, title, description, channels }: ModuleCardProps) {
  return (
    <div className="group rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl gradient-primary shadow-md group-hover:shadow-glow-orange transition-shadow">
        <Icon className="size-6 text-white" />
      </div>
      <h3 className="heading-3 mb-2 text-white">{title}</h3>
      <p className="body-text text-white/70 mb-3">{description}</p>
      {channels && (
        <div className="flex gap-2 flex-wrap">
          {channels.map((channel, idx) => (
            <span key={idx} className="text-lg">{channel}</span>
          ))}
        </div>
      )}
    </div>
  );
}