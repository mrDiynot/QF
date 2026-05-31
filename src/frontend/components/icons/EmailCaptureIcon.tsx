import { Mail } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export default function EmailCaptureIcon({ className, size = 24 }: IconProps) {
  return <Mail className={className} size={size} />;
}