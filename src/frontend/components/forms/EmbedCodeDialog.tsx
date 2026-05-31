'use client';

import { useState } from 'react';
import { Copy, Check, Code, Link2, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeDialog } from './QRCodeDialog';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { config } from '@/lib/config';

interface EmbedCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formSlug: string;
}

export function EmbedCodeDialog({ open, onOpenChange, formId, formSlug }: EmbedCodeDialogProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  // Form URLs - use simulator for preview since public route doesn't exist yet
  const formUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/simulator/forms?formId=${formId}`;
  const _publicFormUrl = `${config.apiBaseUrl}/public/forms/${formSlug}`;

  const jsEmbedCode = `<!-- QualiFlow AI Form Embed -->
<div id="qualiflow-form-${formId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${config.apiBaseUrl}/embed/form.js';
    script.async = true;
    script.onload = function() {
      QualiFlowForm.init({
        formId: '${formId}',
        containerId: 'qualiflow-form-${formId}',
        apiUrl: '${config.apiBaseUrl}'
      });
    };
    document.body.appendChild(script);
  })();
</script>`;

  const iframeEmbedCode = `<!-- QualiFlow AI Form iFrame -->
<iframe 
  src="${formUrl}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="QualiFlow AI Form"
></iframe>`;

  const reactEmbedCode = `// Install: npm install @qualiflow/react-forms

import { QualiFlowForm } from '@qualiflow/react-forms';

function MyComponent() {
  return (
    <QualiFlowForm
      formId="${formId}"
      apiUrl="${config.apiBaseUrl}"
      onSubmit={(data) => {
        console.log('Form submitted:', data);
      }}
    />
  );
}`;

  const handleCopy = async (code: string, tabName: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedTab(tabName);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleOpenForm = () => {
    window.open(formUrl, '_blank');
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Code className="size-5 text-brand-purple" />
            Embed Form
          </ModalTitle>
          <ModalDescription>
            Share your form via direct link or embed it on your website
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
        {/* Direct Link Section */}
        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-primary/10">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-brand-purple" />
            <span className="text-sm font-medium text-foreground">Direct Link</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={formUrl}
              readOnly
              className="bg-white text-sm font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(formUrl, 'link')}
              className="shrink-0 gap-2"
            >
              {copiedTab === 'link' ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenForm}
              className="shrink-0 gap-2"
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link directly with your audience or use the QR code for print materials.
          </p>
        </div>

        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="javascript" className="text-sm">JavaScript</TabsTrigger>
            <TabsTrigger value="iframe" className="text-sm">iFrame</TabsTrigger>
            <TabsTrigger value="react" className="text-sm">React</TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-yellow-400" />
                <span className="text-sm font-medium">JavaScript Embed</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(jsEmbedCode, 'js')}
                className="gap-2"
              >
                {copiedTab === 'js' ? (
                  <><Check className="size-4 text-green-600" /> Copied!</>
                ) : (
                  <><Copy className="size-4" /> Copy Code</>
                )}
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                <code>{jsEmbedCode}</code>
              </pre>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <span>Works on any HTML website. Paste this code where you want the form to appear.</span>
            </div>
          </TabsContent>

          <TabsContent value="iframe" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-400" />
                <span className="text-sm font-medium">iFrame Embed</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(iframeEmbedCode, 'iframe')}
                className="gap-2"
              >
                {copiedTab === 'iframe' ? (
                  <><Check className="size-4 text-green-600" /> Copied!</>
                ) : (
                  <><Copy className="size-4" /> Copy Code</>
                )}
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                <code>{iframeEmbedCode}</code>
              </pre>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <span className="text-info font-bold">ℹ</span>
              <span>Simplest option. Adjust width and height as needed. Limited customization.</span>
            </div>
          </TabsContent>

          <TabsContent value="react" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-cyan-400" />
                <span className="text-sm font-medium">React Component</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(reactEmbedCode, 'react')}
                className="gap-2"
              >
                {copiedTab === 'react' ? (
                  <><Check className="size-4 text-green-600" /> Copied!</>
                ) : (
                  <><Copy className="size-4" /> Copy Code</>
                )}
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                <code>{reactEmbedCode}</code>
              </pre>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <span className="text-info font-bold">⚛</span>
              <span>Best for React apps. Install the package first: <code className="bg-muted px-1 rounded">npm i @qualiflow/react-forms</code></span>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1"
            onClick={() => setShowQRDialog(true)}
          >
            <QrCode className="size-4" />
            Get QR Code
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2 flex-1 gradient-primary text-white"
            onClick={handleOpenForm}
          >
            <ExternalLink className="size-4" />
            Preview Form
          </Button>
        </div>
        </ModalBody>
      </ModalContent>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        formSlug={formSlug}
      />
    </Modal>
  );
}
