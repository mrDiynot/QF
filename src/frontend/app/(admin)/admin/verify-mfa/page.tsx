'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useVerifyMfa } from '@/hooks/admin/useAdminAuth';
import { AdminAuthError } from '@/components/admin/AdminAuthError';
import Link from 'next/link';

function VerifyMfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminId = searchParams.get('adminId');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<unknown>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const verifyMutation = useVerifyMfa();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no admin ID
  useEffect(() => {
    if (!adminId) {
      router.push('/admin/login');
    }
  }, [adminId, router]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
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

    // Focus appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
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

    setError(null);

    try {
      await verifyMutation.mutateAsync({
        adminId: adminId!,
        code: codeToSubmit,
      });
      setSuccessMessage('Verified! Redirecting to dashboard…');
      setTimeout(() => router.push('/admin'), 600);
    } catch (err) {
      setError(err);
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50"
      data-admin-theme="light"
    >
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-orange-50">
              <Shield className="h-8 w-8 text-[#FF6900]" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-gray-500">
              Enter the 6-digit code from your authenticator app
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
            <AdminAuthError error={error} fallbackMessage="Invalid verification code. Please try again." />
          )}

          {/* Code Input */}
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
                className="w-12 h-14 text-center text-2xl font-mono bg-gray-50 border-gray-300 text-gray-900 focus:border-[#FF6900] focus:ring-[#FF6900]"
                disabled={verifyMutation.isPending}
              />
            ))}
          </div>

          <Button
            onClick={() => handleSubmit()}
            className="w-full bg-[#FF6900] hover:bg-orange-600 text-white font-medium"
            disabled={verifyMutation.isPending || code.join('').length !== 6}
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          <div className="text-center">
            <Link 
              href="/admin/login"
              className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyMfaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6900]" />
      </div>
    }>
      <VerifyMfaForm />
    </Suspense>
  );
}
