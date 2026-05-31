import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageProvider } from "@/contexts/PageContext";

export default function PrivacyPage() {
  return (
    <PageProvider isWhiteBackground={true}>
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
        <Navigation />
        
        <main className="pt-22 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                <p className="text-gray-600 mb-6">
                  We collect information you provide directly to us, such as when you sign up for our waitlist, 
                  contact us, or use our services. This may include your name, email address, and other contact information.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-600 mb-6">
                  We use the information we collect to provide, maintain, and improve our services, 
                  to process transactions, and to communicate with you about our products and services.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-600 mb-6">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this privacy policy.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600 mb-6">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-600 mb-6">
                  You have the right to access, update, or delete your personal information. 
                  Please contact us if you would like to exercise these rights.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-600 mb-6">
                  We may update this privacy policy from time to time. We will notify you of any 
                  changes by posting the new policy on this page and updating the &ldquo;Last Updated&rdquo; date.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Last Updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <a 
                href="mailto:hello@qualiflow.ai" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B2D9E] hover:bg-[#5B2486] text-white font-semibold rounded-xl transition-colors"
              >
                Contact Us About Privacy
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageProvider>
  );
}
