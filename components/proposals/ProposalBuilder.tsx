'use client';

/**
 * Proposal Builder Component
 * Create and customize professional proposals
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
  Eye,
  Download,
  Copy,
  User,
  Building2,
  CheckCircle,
  Link,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface ProposalItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface Proposal {
  id?: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  introduction: string;
  items: ProposalItem[];
  terms: string;
  notes?: string;
  currency: string;
  taxRate: number;
}

const DEFAULT_PROPOSAL: Proposal = {
  title: '',
  clientName: '',
  clientEmail: '',
  clientCompany: '',
  status: 'draft',
  validUntil: addDays(new Date(), 30),
  introduction: 'Thank you for the opportunity to submit this proposal. We are excited about the possibility of working together.',
  items: [],
  terms: '• Payment due within 30 days of acceptance\n• 50% deposit required to begin work\n• Prices valid for 30 days',
  notes: '',
  currency: 'USD',
  taxRate: 0,
};

interface ProposalBuilderProps {
  initialProposal?: Partial<Proposal>;
  onSave?: (proposal: Proposal) => void;
  onSend?: (proposal: Proposal) => void;
  className?: string;
}

export function ProposalBuilder({ 
  initialProposal, 
  onSave, 
  onSend, 
  className 
}: ProposalBuilderProps) {
  const [proposal, setProposal] = useState<Proposal>({
    ...DEFAULT_PROPOSAL,
    ...initialProposal,
  });
  const [activeTab, setActiveTab] = useState('details');

  const updateProposal = useCallback(<K extends keyof Proposal>(
    key: K,
    value: Proposal[K]
  ) => {
    setProposal(prev => ({ ...prev, [key]: value }));
  }, []);

  // Generate unique ID
  const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add item
  const addItem = () => {
    const newItem: ProposalItem = {
      id: generateId(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    };
    updateProposal('items', [...proposal.items, newItem]);
  };

  // Update item
  const updateItem = (id: string, updates: Partial<ProposalItem>) => {
    updateProposal('items', proposal.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Delete item
  const deleteItem = (id: string) => {
    updateProposal('items', proposal.items.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = proposal.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discountAmount = itemTotal * (item.discount / 100);
    return sum + (itemTotal - discountAmount);
  }, 0);

  const taxAmount = subtotal * (proposal.taxRate / 100);
  const total = subtotal + taxAmount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal.currency,
    }).format(amount);
  };

  const handleSave = () => {
    if (!proposal.title || !proposal.clientName || !proposal.clientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave?.(proposal);
    toast.success('Proposal saved');
  };

  const handleSend = () => {
    if (!proposal.title || !proposal.clientName || !proposal.clientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (proposal.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    onSend?.(proposal);
    toast.success('Proposal sent');
  };

  return (
    <div className={cn("grid lg:grid-cols-3 gap-6", className)}>
      {/* Editor */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <FileText className="size-5" />
              </div>
              <div>
                <Input
                  value={proposal.title}
                  onChange={(e) => updateProposal('title', e.target.value)}
                  placeholder="Proposal Title"
                  className="text-lg font-semibold border-0 px-0 focus-visible:ring-0"
                />
                <Badge variant={proposal.status === 'draft' ? 'secondary' : 'default'}>
                  {proposal.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} className="gap-2">
                <Save className="size-4" />
                Save
              </Button>
              <Button onClick={handleSend} className="gap-2 bg-primary hover:bg-purple-700">
                <Send className="size-4" />
                Send
              </Button>
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={proposal.clientName}
                    onChange={(e) => updateProposal('clientName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email *</Label>
                  <Input
                    type="email"
                    value={proposal.clientEmail}
                    onChange={(e) => updateProposal('clientEmail', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={proposal.clientCompany || ''}
                    onChange={(e) => updateProposal('clientCompany', e.target.value)}
                    placeholder="Acme Inc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={format(proposal.validUntil, 'yyyy-MM-dd')}
                    onChange={(e) => updateProposal('validUntil', new Date(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Introduction</Label>
                <Textarea
                  value={proposal.introduction}
                  onChange={(e) => updateProposal('introduction', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={proposal.currency}
                    onValueChange={(v) => updateProposal('currency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={proposal.taxRate}
                    onChange={(e) => updateProposal('taxRate', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="space-y-4 mt-6">
              {proposal.items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <FileText className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No items added yet</p>
                  <Button onClick={addItem} className="gap-2">
                    <Plus className="size-4" />
                    Add Item
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {proposal.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg hover:border-border transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="cursor-grab text-muted-foreground/60 mt-2">
                            <GripVertical className="size-4" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="grid sm:grid-cols-2 gap-3">
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                placeholder="Item name"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                  min={1}
                                  className="w-20"
                                  placeholder="Qty"
                                />
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                  min={0}
                                  step={0.01}
                                  placeholder="Price"
                                />
                                <Input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                                  min={0}
                                  max={100}
                                  className="w-20"
                                  placeholder="Disc %"
                                />
                              </div>
                            </div>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateItem(item.id, { description: e.target.value })}
                              placeholder="Item description"
                              rows={2}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <div className="flex justify-end mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Line total: <span className="font-semibold text-foreground">
                              {formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={addItem} variant="outline" className="w-full gap-2">
                    <Plus className="size-4" />
                    Add Item
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Terms Tab */}
            <TabsContent value="terms" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={proposal.terms}
                  onChange={(e) => updateProposal('terms', e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={proposal.notes || ''}
                  onChange={(e) => updateProposal('notes', e.target.value)}
                  placeholder="Any additional notes for the client..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-6">
              <ProposalPreview proposal={proposal} formatCurrency={formatCurrency} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Sidebar - Summary */}
      <div className="space-y-4">
        {/* Client Info */}
        <Card className="p-4">
          <h4 className="font-semibold text-foreground mb-4">Client</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground/60" />
              <span className="text-sm text-muted-foreground">
                {proposal.clientName || 'Not specified'}
              </span>
            </div>
            {proposal.clientCompany && (
              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">{proposal.clientCompany}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-muted-foreground/60" />
              <span className="text-sm text-muted-foreground">
                Valid until {format(proposal.validUntil, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </Card>

        {/* Pricing Summary */}
        <Card className="p-4">
          <h4 className="font-semibold text-foreground mb-4">Summary</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{proposal.items.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {proposal.taxRate > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax ({proposal.taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-4">
          <h4 className="font-semibold text-foreground mb-4">Actions</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Eye className="size-4" />
              Preview
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Download className="size-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Copy className="size-4" />
              Duplicate
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Link className="size-4" />
              Copy Link
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Proposal Preview Component
function ProposalPreview({ 
  proposal, 
  formatCurrency 
}: { 
  proposal: Proposal; 
  formatCurrency: (n: number) => string;
}) {
  const subtotal = proposal.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discountAmount = itemTotal * (item.discount / 100);
    return sum + (itemTotal - discountAmount);
  }, 0);
  const taxAmount = subtotal * (proposal.taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <h2 className="text-2xl font-bold">{proposal.title || 'Untitled Proposal'}</h2>
        <p className="text-white/80 mt-1">
          Prepared for {proposal.clientName || 'Client'}
          {proposal.clientCompany && ` at ${proposal.clientCompany}`}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Introduction */}
        <div>
          <p className="text-muted-foreground">{proposal.introduction}</p>
        </div>

        {/* Items */}
        {proposal.items.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4">Pricing</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 text-sm text-muted-foreground">Item</th>
                  <th className="pb-2 text-sm text-muted-foreground text-right">Qty</th>
                  <th className="pb-2 text-sm text-muted-foreground text-right">Price</th>
                  <th className="pb-2 text-sm text-muted-foreground text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <p className="font-medium">{item.name || 'Item'}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right text-muted-foreground">Subtotal</td>
                  <td className="pt-4 text-right font-medium">{formatCurrency(subtotal)}</td>
                </tr>
                {proposal.taxRate > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-1 text-right text-muted-foreground">
                      Tax ({proposal.taxRate}%)
                    </td>
                    <td className="pt-1 text-right">{formatCurrency(taxAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-semibold text-lg">Total</td>
                  <td className="pt-2 text-right font-bold text-lg text-primary">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Terms */}
        {proposal.terms && (
          <div>
            <h3 className="font-semibold text-foreground mb-2">Terms & Conditions</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{proposal.terms}</p>
          </div>
        )}

        {/* Valid Until */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            This proposal is valid until {format(proposal.validUntil, 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Accept Button */}
        <Button className="w-full gap-2 bg-primary hover:bg-purple-700">
          <CheckCircle className="size-4" />
          Accept Proposal
        </Button>
      </div>
    </div>
  );
}
