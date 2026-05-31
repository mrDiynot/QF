import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageProvider } from "@/contexts/PageContext";

export default function TermsPage() {
  return (
    <PageProvider isWhiteBackground={true}>
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
        <Navigation />
        
        <main className="pt-22 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600">
                By using QualiflowAI, you agree to these terms and conditions.
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-600 mb-6">
                  By accessing and using QualiflowAI, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
                <p className="text-gray-600 mb-6">
                  Permission is granted to temporarily use QualiflowAI for personal, non-commercial 
                  transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
                <p className="text-gray-600 mb-6">
                  The information on this website is provided on an as-is basis. To the fullest extent 
                  permitted by law, this Company disclaims all warranties, express or implied.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
                <p className="text-gray-600 mb-6">
                  In no event shall this Company or its suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business interruption) 
                  arising out of the use or inability to use the materials on QualiflowAI.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy of Materials</h2>
                <p className="text-gray-600 mb-6">
                  The materials appearing on QualiflowAI could include technical, typographical, or 
                  photographic errors. This Company does not warrant that any of the materials on its 
                  website are accurate, complete, or current.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Links</h2>
                <p className="text-gray-600 mb-6">
                  This Company has not reviewed all of the sites linked to our website and is not 
                  responsible for the contents of any such linked site.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
                <p className="text-gray-600 mb-6">
                  This Company may revise these terms of service for its website at any time without 
                  notice. By using this website, you are agreeing to be bound by the then current 
                  version of these terms of service.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-600 mb-6">
                  These terms and conditions are governed by and construed in accordance with the laws 
                  of the jurisdiction in which this Company operates.
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
                Contact Us About Terms
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageProvider>
  );
}
