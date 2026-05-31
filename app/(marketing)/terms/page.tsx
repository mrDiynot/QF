import { Metadata } from 'next';
import { Logo } from '@/components/shared/logo';
import { CloseTabButton } from '@/components/shared/CloseTabButton';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export const metadata: Metadata = {
  title: 'Terms of Service | Qualiflow AI',
  description: 'Qualiflow AI Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo href="/" showText={true} size="md" variant="dark" />
          <CloseTabButton />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-text-navy mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-text-secondary">
          <p className="text-sm text-text-muted mb-8">Last updated: December 9, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Qualiflow AI&apos;s services, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">2. Description of Service</h2>
            <p>
              Qualiflow AI provides an AI-powered lead qualification and conversation management platform 
              that helps businesses capture, qualify, and convert leads through multiple channels 
              including web chat, SMS, voice, and social messaging.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">3. User Accounts</h2>
            <p>
              When you create an account, you must provide accurate and complete information. 
              You are responsible for maintaining the security of your account and password. 
              Qualiflow AI cannot and will not be liable for any loss or damage from your failure 
              to comply with this security obligation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">4. Acceptable Use</h2>
            <p>You agree not to use Qualiflow AI to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Send spam or unsolicited messages</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">5. Data Privacy</h2>
            <p>
              Your use of Qualiflow AI is also governed by our Privacy Policy. By using our service, 
              you consent to our collection and use of data as outlined in the Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">6. Subscription and Payment</h2>
            <p>
              Some features of Qualiflow AI require a paid subscription. By subscribing, you agree 
              to pay all applicable fees. Subscriptions automatically renew unless cancelled 
              before the renewal date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, 
              for any breach of these Terms. Upon termination, your right to use the service 
              will cease immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">8. Limitation of Liability</h2>
            <p>
              Qualiflow AI shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-navy mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@qualiflow.com" className="text-brand-purple hover:underline">
                legal@qualiflow.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <LandingPageFooter />
    </div>
  );
}

