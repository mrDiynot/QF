import { MessageCircle } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export default function WebChatIcon({ className, size = 24 }: IconProps) {
  return <MessageCircle className={className} size={size} />;
}