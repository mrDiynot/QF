import { QrCode } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export default function QRCodeIcon({ className, size = 24 }: IconProps) {
  return <QrCode className={className} size={size} />;
}