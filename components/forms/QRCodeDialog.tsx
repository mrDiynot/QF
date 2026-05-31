'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { config } from '@/lib/config';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formSlug: string;
}

export function QRCodeDialog({ open, onOpenChange, formSlug }: QRCodeDialogProps) {
  const [size, setSize] = useState(256);
  const [copied, setCopied] = useState(false);

  // Multi-tenant aware form URL
  const formUrl = `${config.apiBaseUrl}/forms/${formSlug}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `form-${formSlug}-qr-code.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>QR Code</ModalTitle>
          <ModalDescription>
            Scan this QR code to access your form directly
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center p-6 bg-white rounded-lg border border-border">
            <QRCodeSVG
              id="qr-code-svg"
              value={formUrl}
              size={size}
              level="H"
              includeMargin
            />
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <Label>QR Code Size</Label>
            <Select
              value={size.toString()}
              onValueChange={(value) => setSize(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">Small (128x128)</SelectItem>
                <SelectItem value="256">Medium (256x256)</SelectItem>
                <SelectItem value="512">Large (512x512)</SelectItem>
                <SelectItem value="1024">Extra Large (1024x1024)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form URL */}
          <div className="space-y-2">
            <Label>Form URL</Label>
            <div className="flex gap-2">
              <Input value={formUrl} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

        </ModalBody>

        <ModalFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1 gap-2"
          >
            <Download className="size-4" />
            Download PNG
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 gradient-primary text-white"
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
