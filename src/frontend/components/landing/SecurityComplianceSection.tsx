import { Shield, Lock, Check, Activity } from 'lucide-react';

const SECURITY_FEATURES = [
  { icon: Shield, title: 'SOC 2 Type II', subtitle: 'Certified', color: 'from-green-500 to-green-600' },
  { icon: Lock, title: 'GDPR', subtitle: 'Compliant', color: 'from-blue-500 to-blue-600' },
  { icon: Check, title: '256-bit', subtitle: 'Encryption', color: 'from-purple-500 to-purple-600' },
  { icon: Activity, title: '99.9%', subtitle: 'Uptime SLA', color: 'from-orange-500 to-orange-600' },
];

export function SecurityComplianceSection() {
  return (
    <section className="py-16 px-6 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-gray-500 font-semibold uppercase tracking-wider mb-8">
          Enterprise-Grade Security
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {SECURITY_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-xs text-gray-600">{feature.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SecurityComplianceSection;
