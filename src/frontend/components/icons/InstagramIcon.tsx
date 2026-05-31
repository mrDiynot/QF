import { Instagram } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export default function InstagramIcon({ className, size = 24 }: IconProps) {
  return <Instagram className={className} size={size} />;
}