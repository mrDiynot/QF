import { ComingSoonSection } from '@/components/dashboard/coming-soon-card';
import { FlaskConical } from 'lucide-react';

export default function TestingCenterPage() {
  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-text-navy">Testing Center</h1>
        <p className="text-base mt-3 text-text-secondary">
          Test and optimize your customer journeys, forms, and automation workflows
        </p>
      </div>

      <ComingSoonSection
        icon={<FlaskConical className="size-12 text-brand-purple" />}
        title="A/B Testing & Optimization"
        description="Run experiments on your forms, journeys, and messaging to find what works best. Track performance metrics and make data-driven decisions to improve conversion rates."
        actionText="View Testing Documentation"
        actionHref="/dashboard/articles"
      />
    </div>
  );
}