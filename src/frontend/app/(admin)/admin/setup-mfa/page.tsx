'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, Copy, Check, CheckCircle } from 'lucide-react';
import { useEnableMfa, useConfirmMfaSetup } from '@/hooks/admin/useAdminAuth';
import { AdminAuthError } from '@/components/admin/AdminAuthError';

function SetupMfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get('session');
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<unknown>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const enableMfaMutation = useEnableMfa();
  const confirmMfaMutation = useConfirmMfaSetup();

  // Fetch QR code on mount
  useEffect(() => {
    if (sessionToken) {
      enableMfaMutation.mutate(
        { sessionToken },
        {
          onSuccess: (data) => {
            setQrCode(data.qrCodeImage);
            setSecret(data.secret);
          },
          onError: (err) => {
            setError(err);
          },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  // Redirect if no session token
  useEffect(() => {
    if (!sessionToken) {
      router.push('/admin/login');
    }
  }, [sessionToken, router]);

  const handleCopySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (fullCode?: string) => {
    const codeToSubmit = fullCode || code.join('');
    if (codeToSubmit.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!secret) {
      setError('Setup not initialized. Please refresh and try again.');
      return;
    }

    setError(null);

    try {
      await confirmMfaMutation.mutateAsync({
        sessionToken: sessionToken!,
        secret,
        code: codeToSubmit,
      });
      setSuccessMessage('MFA setup complete! Redirecting to dashboard…');
      // Router push handled in onSuccess callback
    } catch (err) {
      setError(err);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50"
      data-admin-theme="light"
    >
      <Card className="w-full max-w-lg bg-white border-gray-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-orange-50">
              <Shield className="h-8 w-8 text-[#FF6900]" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900">Set Up Two-Factor Authentication</CardTitle>
            <CardDescription className="text-gray-500">
              MFA is required for all admin accounts
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}

          {!!error && !successMessage && (
            <AdminAuthError error={error} fallbackMessage="Failed to setup MFA. Please try again." />
          )}

          {/* Step 1: QR Code */}
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium text-[#FF6900]">Step 1:</span> Scan this QR code with your authenticator app
            </div>
            <div className="flex justify-center">
              {qrCode ? (
                <div className="p-4 bg-white rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
                    alt="QR Code" 
                    width={180} 
                    height={180} 
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF6900]" />
                </div>
              )}
            </div>
          </div>

          {/* Manual Entry */}
          {secret && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                Or enter this code manually:
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm font-mono text-gray-900 border border-gray-300">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                  className="border-gray-200 hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#FF6900]" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Verify */}
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium text-[#FF6900]">Step 2:</span> Enter the 6-digit code from your app
            </div>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-12 text-center text-xl font-mono bg-gray-50 border-gray-300 text-gray-900 focus:border-[#FF6900]"
                  disabled={confirmMfaMutation.isPending}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleSubmit()}
            className="w-full bg-[#FF6900] hover:bg-orange-600 text-white font-medium"
            disabled={confirmMfaMutation.isPending || code.join('').length !== 6}
          >
            {confirmMfaMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupMfaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6900]" />
      </div>
    }>
      <SetupMfaForm />
    </Suspense>
  );
}
