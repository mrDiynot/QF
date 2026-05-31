'use client';

/**
 * Workflow Gallery Page
 * Showcases all 10 prebuilt workflows with visual builders
 */

import { WorkflowGallery } from '@/components/workflows/WorkflowGallery';

export default function WorkflowGalleryPage() {
  return (
    <div className="p-8">
      <WorkflowGallery />
    </div>
  );
}
