'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { adminAuthService } from '@/services/api/admin.service';
import { AdminAuthError } from '@/components/admin/AdminAuthError';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await adminAuthService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-2xl text-gray-900">Reset Password</CardTitle>
            <CardDescription className="text-gray-500">
              Enter your email to receive a password reset link
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  If an account with that email exists, a password reset link has been sent. 
                  Please check your inbox and spam folder.
                </AlertDescription>
              </Alert>
              <Link href="/admin/login">
                <Button
                  className="w-full bg-[#FF6900] hover:bg-orange-600 text-white font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!!error && (
                <AdminAuthError error={error} fallbackMessage="Failed to send reset link. Please try again." />
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@qualiflow.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6900] focus:ring-[#FF6900]/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF6900] hover:bg-orange-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center">
                <Link 
                  href="/admin/login"
                  className="text-sm text-gray-500 hover:text-[#FF6900] inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              This is a restricted area. Unauthorized access is prohibited.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
