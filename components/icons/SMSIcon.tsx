import { MessageSquare } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export default function SMSIcon({ className, size = 24 }: IconProps) {
  return <MessageSquare className={className} size={size} />;
}