'use client';

/**
 * Contact Us Page
 * For Enterprise plan inquiries and general contact
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Building2, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { GradientButton } from '@/components/shared/gradient-button';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Thank you! Our team will contact you within 24 hours.');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in QualiFlow AI Enterprise. Our team will review your request and contact you within 24 hours.
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="py-6 px-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/">
            <Logo showText={true} size="md" variant="dark" />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Contact Our Sales Team</CardTitle>
              <CardDescription>
                Interested in QualiFlow AI Enterprise? Fill out the form and our team will reach out within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" name="company" required placeholder="Acme Corporation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>

              
                <div className="space-y-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your needs, team size, and any specific requirements..."
                    required
                  />
                </div>
                
               {/* Preferred Date */}
                <div className="space-y-2">
                  <Label htmlFor="preferredDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Preferred date to contact you
                  </Label>
                  <Input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <GradientButton type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4 ml-2" />
                </GradientButton>
              </form>
            </CardContent>
          </Card>

          {/* Right: Enterprise Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Enterprise-Grade AI Lead Qualification
              </h2>
              <p className="text-lg text-gray-600">
                Custom solutions for businesses that need scalable, secure, and fully customizable AI-powered lead engagement.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Building2, title: 'Custom Volume Limits', desc: 'Tailored to your business scale' },
                { icon: Phone, title: 'Dedicated Support', desc: '24/7 priority support with dedicated account manager' },
                { icon: Mail, title: 'Custom Integrations', desc: 'Connect with your existing CRM and tools' },
                { icon: Calendar, title: 'Onboarding & Training', desc: 'White-glove implementation assistance' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <LandingPageFooter />
    </div>
  );
}

