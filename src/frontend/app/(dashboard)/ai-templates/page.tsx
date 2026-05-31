'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Copy,
  Play,
  Search,
  Filter,
  MoreVertical,
  Zap,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { aiTemplatesService, type AiResponseTemplateDto } from '@/services/api';
import { toast } from 'sonner';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'empathetic', label: 'Empathetic' },
];

const DEFAULT_CATEGORIES = [
  'Sales',
  'Support',
  'Follow-up',
  'Onboarding',
  'General',
];

export default function AiTemplatesPage() {
  const [templates, setTemplates] = useState<AiResponseTemplateDto[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AiResponseTemplateDto | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    prompt: '',
    variables: [] as string[],
    tone: 'professional',
    maxTokens: 500,
    isActive: true,
  });
  
  // Generate state
  const [generateVariables, setGenerateVariables] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await aiTemplatesService.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await aiTemplatesService.getCategories();
      if (data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const newTemplate = await aiTemplatesService.create({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        prompt: formData.prompt,
        variables: formData.variables,
        tone: formData.tone,
        maxTokens: formData.maxTokens,
        isActive: formData.isActive,
      });
      setTemplates([...templates, newTemplate]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Template created successfully');
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;
    try {
      const updated = await aiTemplatesService.update(selectedTemplate.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        prompt: formData.prompt,
        variables: formData.variables,
        tone: formData.tone,
        maxTokens: formData.maxTokens,
        isActive: formData.isActive,
      });
      setTemplates(templates.map(t => t.id === updated.id ? updated : t));
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await aiTemplatesService.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    try {
      setIsGenerating(true);
      const result = await aiTemplatesService.generate(selectedTemplate.id, {
        variables: generateVariables,
      });
      setGeneratedContent(result.generatedContent);
      toast.success(`Generated using ${result.tokensUsed} tokens`);
    } catch (error) {
      console.error('Failed to generate:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  };

  const openEditDialog = (template: AiResponseTemplateDto) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      prompt: template.prompt,
      variables: template.variables,
      tone: template.tone,
      maxTokens: template.maxTokens,
      isActive: template.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openGenerateDialog = (template: AiResponseTemplateDto) => {
    setSelectedTemplate(template);
    const vars: Record<string, string> = {};
    template.variables.forEach(v => vars[v] = '');
    setGenerateVariables(vars);
    setGeneratedContent('');
    setIsGenerateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      prompt: '',
      variables: [],
      tone: 'professional',
      maxTokens: 500,
      isActive: true,
    });
    setSelectedTemplate(null);
  };

  const extractVariables = (prompt: string) => {
    const matches = prompt.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    categories: [...new Set(templates.map(t => t.category))].length,
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">AI Response Templates</h1>
            <p className="body-text mt-2 text-text-secondary">
              Create reusable AI-powered templates for consistent, high-quality responses
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2 rounded-[10px] gradient-primary text-white"
          >
            <Plus className="size-4" />
            New Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Templates', value: stats.total, icon: MessageSquare },
            { label: 'Active Templates', value: stats.active, icon: Zap },
            { label: 'Total Generations', value: stats.totalUsage.toLocaleString(), icon: Sparkles },
            { label: 'Categories', value: stats.categories, icon: Filter },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                  <stat.icon className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="small-text text-text-secondary">{stat.label}</p>
                  <p className="text-2xl font-semibold text-text-navy">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="mx-auto size-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No templates yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first AI response template to get started
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-4 gap-2"
            >
              <Plus className="size-4" />
              Create Template
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg gradient-primary">
                      <Sparkles className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(template)}>
                        <Edit className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openGenerateDialog(template)}>
                        <Play className="mr-2 size-4" />
                        Generate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                  {template.description || template.prompt.substring(0, 100)}...
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    {template.usageCount} uses
                  </span>
                  <span>•</span>
                  <span>{template.tone}</span>
                  <span>•</span>
                  <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {template.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.variables.map(v => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="mr-1 size-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 gradient-primary text-white"
                    onClick={() => openGenerateDialog(template)}
                  >
                    <Play className="mr-1 size-3" />
                    Generate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Modal open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>
              {isEditDialogOpen ? 'Edit Template' : 'Create New Template'}
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Follow-up"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the template"
              />
            </div>

            <div className="space-y-2">
              <Label>Prompt Template</Label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => {
                  const newPrompt = e.target.value;
                  setFormData({ 
                    ...formData, 
                    prompt: newPrompt,
                    variables: extractVariables(newPrompt),
                  });
                }}
                placeholder="Enter your prompt template. Use {{variableName}} for dynamic values."
                rows={6}
              />
              <p className="text-xs text-gray-500">
                Use {`{{variableName}}`} syntax for variables that will be filled at generation time.
              </p>
            </div>

            {formData.variables.length > 0 && (
              <div className="space-y-2">
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map(v => (
                    <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(v) => setFormData({ ...formData, tone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  min={100}
                  max={4000}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={isEditDialogOpen ? handleUpdate : handleCreate}
              className="gradient-primary text-white"
            >
              {isEditDialogOpen ? 'Save Changes' : 'Create Template'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Generate Dialog */}
      <Modal open={isGenerateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsGenerateDialogOpen(false);
          setSelectedTemplate(null);
          setGeneratedContent('');
        }
      }}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-purple-600" />
              Generate from Template
            </ModalTitle>
          </ModalHeader>

          {selectedTemplate && (
            <ModalBody className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                <p className="mt-1 text-sm text-gray-500">{selectedTemplate.description}</p>
              </div>

              {selectedTemplate.variables.length > 0 && (
                <div className="space-y-3">
                  <Label>Fill in Variables</Label>
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable} className="space-y-1">
                      <Label className="text-sm text-gray-600">{variable}</Label>
                      <Input
                        value={generateVariables[variable] || ''}
                        onChange={(e) => setGenerateVariables({
                          ...generateVariables,
                          [variable]: e.target.value,
                        })}
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gradient-primary text-white"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate Response
                  </>
                )}
              </Button>

              {generatedContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Content</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        toast.success('Copied to clipboard');
                      }}
                    >
                      <Copy className="mr-1 size-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <p className="whitespace-pre-wrap text-sm">{generatedContent}</p>
                  </div>
                </div>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
