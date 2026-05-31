'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  ArrowLeft,
  Download,
  KeyRound
} from 'lucide-react';
import { securityService } from '@/services/api/security.service';
import Image from 'next/image';
import Link from 'next/link';

type SetupStep = 'start' | 'qrcode' | 'verify' | 'recovery' | 'complete';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('start');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codesDownloaded, setCodesDownloaded] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await securityService.setup2FA();
      setQrCode(response.qrCodeImage);
      setSecret(response.secret);
      setStep('qrcode');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

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
        handleVerifyCode(fullCode);
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
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('');
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await securityService.enable2FA({ code: codeToVerify });
      setRecoveryCodes(response.recoveryCodes);
      setStep('recovery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCodes = () => {
    const content = `QualiFlow AI Recovery Codes
Generated: ${new Date().toISOString()}

IMPORTANT: Store these codes securely. Each code can only be used once.

${recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, use one of these codes to sign in.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qualiflow-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCodesDownloaded(true);
  };

  const handleComplete = () => {
    router.push('/settings/security');
  };

  useEffect(() => {
    if (step === 'qrcode') {
      setStep('verify');
    }
  }, [step]);

  return (
    <div className="container max-w-2xl py-8">
      <Link 
        href="/settings/security"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Security Settings
      </Link>

      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">
              {step === 'start' && 'Enable Two-Factor Authentication'}
              {step === 'verify' && 'Scan QR Code'}
              {step === 'recovery' && 'Save Recovery Codes'}
              {step === 'complete' && '2FA Enabled Successfully'}
            </CardTitle>
            <CardDescription>
              {step === 'start' && 'Add an extra layer of security to your account'}
              {step === 'verify' && 'Scan the QR code with your authenticator app'}
              {step === 'recovery' && 'Store these codes in a safe place'}
              {step === 'complete' && 'Your account is now protected with 2FA'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Start */}
          {step === 'start' && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium">What you&apos;ll need:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    An authenticator app (Google Authenticator, Authy, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Your phone or tablet to scan the QR code
                  </li>
                </ul>
              </div>

              <Button onClick={handleStartSetup} className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Start Setup
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: QR Code + Verify */}
          {step === 'verify' && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mr-2">Step 1</Badge>
                  Scan this QR code with your authenticator app
                </div>
                <div className="flex justify-center">
                  {qrCode ? (
                    <div className="p-4 bg-white rounded-lg border">
                      <Image src={qrCode} alt="QR Code" width={180} height={180} />
                    </div>
                  ) : (
                    <div className="w-[180px] h-[180px] bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Entry */}
              {secret && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Or enter this code manually:
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Verify Code */}
              <div className="space-y-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mr-2">Step 2</Badge>
                  Enter the 6-digit code from your app
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
                      className="w-12 h-14 text-center text-2xl font-mono"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleVerifyCode()}
                className="w-full"
                disabled={loading || code.join('').length !== 6}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
                ) : (
                  'Verify & Enable'
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Recovery Codes */}
          {step === 'recovery' && (
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Save these recovery codes in a secure location. 
                  If you lose access to your authenticator app, you can use one of these codes to sign in.
                  Each code can only be used once.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded text-center">
                    {code}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleDownloadCodes}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Recovery Codes
              </Button>

              <Button
                onClick={handleComplete}
                className="w-full"
                disabled={!codesDownloaded}
              >
                {codesDownloaded ? (
                  'Complete Setup'
                ) : (
                  'Download codes to continue'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
