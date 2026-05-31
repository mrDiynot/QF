'use client';

/**
 * Lead Enrichment Panel Component
 * Sprint 37 Feature - Enrich lead data with company and person info
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Building2,
  User,
  Globe,
  Linkedin,
  Twitter,
  MapPin,
  Users,
  DollarSign,
  Loader2,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useEnrichLead,
  useBulkEnrichLeads,
  useCompanyLookup,
  usePersonLookup,
} from '@/hooks/api/useLeadEnrichment';

interface LeadEnrichmentPanelProps {
  leadId?: string;
  leadEmail?: string;
  className?: string;
  onEnriched?: () => void;
}

export function LeadEnrichmentPanel({
  leadId,
  leadEmail,
  className,
  onEnriched,
}: LeadEnrichmentPanelProps) {
  const [lookupEmail, setLookupEmail] = useState(leadEmail || '');
  const [lookupDomain, setLookupDomain] = useState('');

  const enrichLeadMutation = useEnrichLead();
  const { data: personData, isLoading: loadingPerson } = usePersonLookup(lookupEmail);
  const { data: companyData, isLoading: loadingCompany } = useCompanyLookup(lookupDomain);

  const handleEnrichLead = async () => {
    if (!leadId) return;
    
    try {
      await enrichLeadMutation.mutateAsync(leadId);
      toast.success('Lead enriched successfully');
      onEnriched?.();
    } catch {
      toast.error('Failed to enrich lead');
    }
  };

  // Extract domain from email
  const extractDomain = (email: string) => {
    const match = email.match(/@([^@]+)$/);
    return match ? match[1] : '';
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Lead Enrichment</h3>
          <p className="text-sm text-muted-foreground">Enhance lead data with AI</p>
        </div>
      </div>

      {/* Quick Enrich Button */}
      {leadId && (
        <Button
          onClick={handleEnrichLead}
          disabled={enrichLeadMutation.isPending}
          className="w-full mb-6 gap-2"
        >
          {enrichLeadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Enrich This Lead
        </Button>
      )}

      {/* Manual Lookup Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Person Lookup</Label>
          <div className="flex gap-2">
            <Input
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="Enter email address"
              type="email"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const domain = extractDomain(lookupEmail);
                if (domain) setLookupDomain(domain);
              }}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>

        {/* Person Results */}
        {loadingPerson && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        )}
        
        {personData && (
          <div className="p-4 rounded-lg bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground/60" />
              <span className="font-medium">{personData.fullName}</span>
            </div>
            {personData.jobTitle && (
              <p className="text-sm text-muted-foreground">{personData.jobTitle}</p>
            )}
            {personData.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                {personData.company}
              </div>
            )}
            <div className="flex gap-2">
              {personData.linkedIn && (
                <a href={personData.linkedIn} target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="gap-1">
                    <Linkedin className="size-3" />
                    LinkedIn
                  </Badge>
                </a>
              )}
              {personData.twitter && (
                <a href={personData.twitter} target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="gap-1">
                    <Twitter className="size-3" />
                    Twitter
                  </Badge>
                </a>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Company Lookup</Label>
          <div className="flex gap-2">
            <Input
              value={lookupDomain}
              onChange={(e) => setLookupDomain(e.target.value)}
              placeholder="Enter company domain"
            />
          </div>
        </div>

        {/* Company Results */}
        {loadingCompany && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        )}
        
        {companyData && (
          <div className="p-4 rounded-lg bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground/60" />
              <span className="font-medium">{companyData.name}</span>
            </div>
            {companyData.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{companyData.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {companyData.industry && (
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">{companyData.industry}</Badge>
                </div>
              )}
              {companyData.employeeCount && (
                <div className="flex items-center gap-1">
                  <Users className="size-3" />
                  {companyData.employeeCount} employees
                </div>
              )}
              {companyData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {companyData.location}
                </div>
              )}
              {companyData.revenue && (
                <div className="flex items-center gap-1">
                  <DollarSign className="size-3" />
                  {companyData.revenue}
                </div>
              )}
            </div>
            {companyData.website && (
              <a 
                href={companyData.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="size-3" />
                {companyData.website}
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Bulk Enrichment Button Component
interface BulkEnrichButtonProps {
  selectedLeadIds: string[];
  onComplete?: () => void;
}

export function BulkEnrichButton({ selectedLeadIds, onComplete }: BulkEnrichButtonProps) {
  const bulkEnrichMutation = useBulkEnrichLeads();

  const handleBulkEnrich = async () => {
    if (selectedLeadIds.length === 0) return;
    
    try {
      await bulkEnrichMutation.mutateAsync({ leadIds: selectedLeadIds });
      toast.success(`Enriched ${selectedLeadIds.length} leads`);
      onComplete?.();
    } catch {
      toast.error('Failed to enrich leads');
    }
  };

  return (
    <Button
      onClick={handleBulkEnrich}
      disabled={bulkEnrichMutation.isPending || selectedLeadIds.length === 0}
      variant="outline"
      className="gap-2"
    >
      {bulkEnrichMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      Enrich Selected ({selectedLeadIds.length})
    </Button>
  );
}
