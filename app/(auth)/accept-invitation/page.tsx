'use client';

import { Suspense } from 'react';
import { AcceptInvitationForm } from '@/components/auth/AcceptInvitationForm';
import { Logo } from '@/components/shared/logo';
import { Lock, ShieldCheck, Users, Building2 } from 'lucide-react';

function AcceptInvitationContent() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-white border-r border-gray-200">
        {/* Logo */}
        <div>
          <Logo href="/" showText={true} size="lg" variant="default" />
        </div>

        {/* Main content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              You&apos;ve Been Invited to Join a Team
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Complete your account setup to start collaborating with your team on QualiFlow AI.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: Users, text: 'Collaborate with your team in real-time' },
              { icon: Building2, text: 'Access shared leads and conversations' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center size-6 rounded-full bg-green-100">
                  <benefit.icon className="size-4 text-green-600" />
                </div>
                <span className="text-gray-900 font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Empty footer space */}
        <div />
      </div>

      {/* Right Side - Accept Invitation Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-[480px] animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo href="/" showText={true} size="lg" variant="default" />
          </div>

          {/* Accept Invitation Card */}
          <div className="rounded-2xl border border-border/50 bg-white shadow-elevation-xl">
            <div className="p-8 lg:p-10">
              <AcceptInvitationForm />
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-green-600" />
              <span className="text-sm text-gray-600">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-green-600" />
              <span className="text-sm text-gray-600">SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}

