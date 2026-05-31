import { Facebook } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export default function FacebookIcon({ className, size = 24 }: IconProps) {
  return <Facebook className={className} size={size} />;
}