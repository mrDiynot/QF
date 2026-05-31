'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck2, Plus, Search, Filter, Eye, Edit, Trash2, Send,
  CheckCircle, XCircle, Clock, AlertCircle, Download, FileText,
  DollarSign, Calendar, User, Sparkles, Mail, Phone, X, Save, MessageSquare, Bot, Zap, Building2, Upload, Image,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Type, Heading1, Heading2, Heading3,
  Quote, Code, Minus, ChevronDown, ImagePlus, FileImage, Table
} from 'lucide-react';

type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';
type ProposalSource = 'ai-conversation' | 'ai-assisted' | 'manual';

type Proposal = {
  id: number;
  title: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  status: ProposalStatus;
  created: string;
  sentDate?: string;
  content: string;
  source: ProposalSource;
  conversationId?: string;
};

type CMSFile = {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
  category: string;
};

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const [currentFontSize, setCurrentFontSize] = useState('16px');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const [newProposal, setNewProposal] = useState({
    title: '',
    customer: '',
    email: '',
    phone: '',
    amount: '',
    content: '',
    companyName: '',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: ''
  });

  // Mock CMS files
  const cmsFiles: CMSFile[] = [
    { id: 1, name: 'company-logo.svg', type: 'image/svg+xml', size: '24 KB', url: 'https://via.placeholder.com/200x80/6B2D9E/FFFFFF?text=Logo', category: 'Logos' },
    { id: 2, name: 'brand-banner.png', type: 'image/png', size: '156 KB', url: 'https://via.placeholder.com/800x200/FF5722/FFFFFF?text=Banner', category: 'Images' },
    { id: 3, name: 'team-photo.jpg', type: 'image/jpeg', size: '245 KB', url: 'https://via.placeholder.com/600x400/2D1B4E/FFFFFF?text=Team', category: 'Images' },
    { id: 4, name: 'product-shot.png', type: 'image/png', size: '189 KB', url: 'https://via.placeholder.com/500x500/FF6B35/FFFFFF?text=Product', category: 'Images' },
  ];

  const proposals: Proposal[] = [
    {
      id: 1,
      title: 'QualiFlow Enterprise Implementation',
      customer: 'Sarah Johnson',
      email: 'sarah.j@acmecorp.com',
      phone: '+1 (555) 123-4567',
      amount: 45000,
      status: 'sent',
      created: '2025-11-28',
      sentDate: '2025-11-29',
      content: 'Complete QualiFlow platform implementation with custom integrations, dedicated support, and 12 months of premium service.',
      source: 'ai-conversation',
      conversationId: 'conv_12345'
    },
    {
      id: 2,
      title: 'AI Automation Package',
      customer: 'Mike Chen',
      email: 'mike.chen@techstartup.com',
      phone: '+1 (555) 234-5678',
      amount: 12000,
      status: 'accepted',
      created: '2025-11-25',
      sentDate: '2025-11-26',
      content: 'AI-powered customer journey automation with email, SMS, and voice capabilities. Includes setup, training, and 6 months support.',
      source: 'ai-assisted'
    },
    {
      id: 3,
      title: 'Custom CRM Integration',
      customer: 'Emily Rodriguez',
      email: 'emily.r@salesforce.com',
      phone: '+1 (555) 345-6789',
      amount: 8500,
      status: 'draft',
      created: '2025-11-29',
      content: 'Integration of QualiFlow with existing Salesforce CRM, custom workflows, and data migration services.',
      source: 'manual'
    },
    {
      id: 4,
      title: 'Lead Generation Campaign',
      customer: 'David Brown',
      email: 'david.b@marketing.io',
      phone: '+1 (555) 456-7890',
      amount: 15000,
      status: 'sent',
      created: '2025-11-27',
      sentDate: '2025-11-28',
      content: '3-month lead generation campaign with AI-powered qualification, automated follow-ups, and performance analytics.',
      source: 'ai-conversation',
      conversationId: 'conv_67890'
    },
    {
      id: 5,
      title: 'Review Collection System',
      customer: 'Rachel Green',
      email: 'rachel.g@dental.com',
      phone: '+1 (555) 567-8901',
      amount: 5500,
      status: 'declined',
      created: '2025-11-26',
      sentDate: '2025-11-27',
      content: 'Automated review collection system with SMS and email outreach, sentiment analysis, and reputation management.',
      source: 'manual'
    }
  ];

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = searchQuery === '' ||
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'declined': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: ProposalStatus) => {
    switch (status) {
      case 'draft': return Clock;
      case 'sent': return Send;
      case 'accepted': return CheckCircle;
      case 'declined': return XCircle;
      default: return FileText;
    }
  };

  const getSourceBadge = (source: ProposalSource) => {
    switch (source) {
      case 'ai-conversation':
        return {
          icon: Bot,
          label: 'AI Generated from Conversation',
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        };
      case 'ai-assisted':
        return {
          icon: Sparkles,
          label: 'AI Assisted',
          color: 'bg-purple-100 text-purple-700 border-purple-200'
        };
      case 'manual':
        return {
          icon: User,
          label: 'Manual',
          color: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }
  };

  const handleCreateProposal = () => {
    if (newProposal.title && newProposal.customer && newProposal.amount) {
      alert(`Creating proposal: ${newProposal.title}\nCustomer: ${newProposal.customer}\nAmount: $${newProposal.amount}`);
      setShowCreateModal(false);
      setNewProposal({
        title: '',
        customer: '',
        email: '',
        phone: '',
        amount: '',
        content: '',
        companyName: '',
        companyLogo: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        companyWebsite: ''
      });
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }
    }
  };

  const handleAIAssist = () => {
    if (!aiPrompt.trim()) return;

    const userMessage = { role: 'user' as const, content: aiPrompt };
    setAiMessages([...aiMessages, userMessage]);

    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: `Based on your request: "${aiPrompt}"\n\nHere&apos;s a draft proposal section:\n\nDear ${newProposal.customer || '[Customer Name]'},\n\nThank you for your interest in our services. Based on our conversation, I&apos;ve prepared a customized proposal that addresses your specific needs.\n\n[This is where detailed proposal content would go based on your description]\n\nWe&apos;re excited to work with you and deliver exceptional results.\n\nBest regards,\nYour Team`
      };
      setAiMessages(prev => [...prev, aiResponse]);
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = aiResponse.content.replace(/\n/g, '<br>');
      }
    }, 1000);
    setAiPrompt('');
  };

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const insertImage = (imageUrl: string) => {
    const img = `<img src="${imageUrl}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
    document.execCommand('insertHTML', false, img);
    setShowImagePicker(false);
  };

  const insertTable = () => {
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableColumns; j++) {
        if (i === 0) {
          tableHTML += '<th style="border: 1px solid #ddd; padding: 12px; background-color: #f3f4f6; text-align: left; font-weight: 600;">Header</th>';
        } else {
          tableHTML += '<td style="border: 1px solid #ddd; padding: 12px;">Cell</td>';
        }
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table><p><br></p>';
    document.execCommand('insertHTML', false, tableHTML);
    setShowTableDialog(false);
    contentEditableRef.current?.focus();
  };

  const changeFontSize = (size: string) => {
    setCurrentFontSize(size);
    execCommand('fontSize', '7');
    const fontElements = contentEditableRef.current?.querySelectorAll('font[size="7"]');
    fontElements?.forEach(el => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = size;
    });
  };

  const changeFontFamily = (font: string) => {
    setCurrentFontFamily(font);
    execCommand('fontName', font);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Proposals</h1>
            <p className="text-gray-600">AI-generated and manual customer proposals</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAIAssistant(true);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Bot className="w-4 h-4" />
              Create with AI Assistant
            </button>
            <button
              onClick={() => {
                setShowAIAssistant(false);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-950">
              {proposals.filter(p => p.source === 'ai-conversation').length}
            </div>
          </div>
          <div className="text-sm text-gray-600">AI Generated from Convos</div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-950">
              {proposals.filter(p => p.source === 'ai-assisted').length}
            </div>
          </div>
          <div className="text-sm text-gray-600">AI Assisted</div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-950">
              {proposals.filter(p => p.source === 'manual').length}
            </div>
          </div>
          <div className="text-sm text-gray-600">Manual</div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-950">
              ${proposals.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {([
              { value: 'all' as const, label: 'All', count: proposals.length },
              { value: 'draft' as ProposalStatus, label: 'Draft', count: proposals.filter(p => p.status === 'draft').length },
              { value: 'sent' as ProposalStatus, label: 'Sent', count: proposals.filter(p => p.status === 'sent').length },
              { value: 'accepted' as ProposalStatus, label: 'Accepted', count: proposals.filter(p => p.status === 'accepted').length },
              { value: 'declined' as ProposalStatus, label: 'Declined', count: proposals.filter(p => p.status === 'declined').length }
            ]).map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  statusFilter === filter.value
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const StatusIcon = getStatusIcon(proposal.status);
          const sourceBadge = getSourceBadge(proposal.source);
          const SourceIcon = sourceBadge.icon;

          return (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedProposal(proposal)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shrink-0">
                  <FileCheck2 className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-blue-950">{proposal.title}</h3>
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium flex items-center gap-1 ${sourceBadge.color}`}>
                      <SourceIcon className="w-3 h-3" />
                      {sourceBadge.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                    {proposal.conversationId && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        From Conversation
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      {proposal.customer}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {proposal.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      ${proposal.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {proposal.created}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{proposal.content}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProposal(proposal);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Edit proposal');
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-all flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    {proposal.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Sending proposal to ${proposal.customer}`);
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-all flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Download PDF');
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Modal with Rich Text Editor */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-950">
                      {showAIAssistant ? 'Create Proposal with AI Assistant' : 'Create New Proposal'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {showAIAssistant ? 'Describe what you need and AI will help generate content' : 'Design your proposal with our document editor'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Customer Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposal Title *
                    </label>
                    <input
                      type="text"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Website Redesign Project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={newProposal.customer}
                      onChange={(e) => setNewProposal({ ...newProposal, customer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newProposal.email}
                      onChange={(e) => setNewProposal({ ...newProposal, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposal Amount * ($)
                    </label>
                    <input
                      type="number"
                      value={newProposal.amount}
                      onChange={(e) => setNewProposal({ ...newProposal, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="5000"
                    />
                  </div>
                </div>

                {/* AI Assistant Section */}
                {showAIAssistant && (
                  <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">AI Assistant</h3>
                    </div>

                    {/* AI Chat Messages */}
                    {aiMessages.length > 0 && (
                      <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                        {aiMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-white border border-indigo-200 ml-8'
                                : 'bg-indigo-100 border border-indigo-300 mr-8'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {msg.role === 'assistant' && <Bot className="w-4 h-4 text-indigo-600" />}
                              {msg.role === 'user' && <User className="w-4 h-4 text-gray-600" />}
                              <span className="text-xs font-medium text-gray-600">
                                {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Prompt Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAIAssist()}
                        placeholder="Describe what this proposal should include..."
                        className="flex-1 px-4 py-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <button
                        onClick={handleAIAssist}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Tell AI what services you&apos;re proposing, the scope, deliverables, timeline, etc.
                    </p>
                  </div>
                )}

                {/* Rich Text Editor */}
                <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                  {/* Toolbar */}
                  <div className="bg-gray-100 border-b border-gray-300 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Font Family */}
                      <select
                        value={currentFontFamily}
                        onChange={(e) => changeFontFamily(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>

                      {/* Font Size */}
                      <select
                        value={currentFontSize}
                        onChange={(e) => changeFontSize(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm"
                      >
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="32px">32px</option>
                      </select>

                      <div className="w-px h-6 bg-gray-300"></div>

                      {/* Headings */}
                      <button onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading 1">
                        <Heading1 className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading 2">
                        <Heading2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('formatBlock', 'h3')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading 3">
                        <Heading3 className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-gray-300"></div>

                      {/* Text Formatting */}
                      <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Underline">
                        <Underline className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-gray-300"></div>

                      {/* Alignment */}
                      <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Left">
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Center">
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Right">
                        <AlignRight className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-gray-300"></div>

                      {/* Lists */}
                      <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bullet List">
                        <List className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-gray-300"></div>

                      {/* Special */}
                      <button onClick={() => execCommand('insertHorizontalRule')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Insert Line">
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const url = prompt('Enter link URL:');
                          if (url) execCommand('createLink', url);
                        }}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>

                      {/* Insert Image from CMS */}
                      <button
                        onClick={() => setShowImagePicker(!showImagePicker)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors bg-orange-100"
                        title="Insert Image from CMS"
                      >
                        <ImagePlus className="w-4 h-4 text-orange-600" />
                      </button>

                      {/* Insert Table */}
                      <button
                        onClick={() => setShowTableDialog(!showTableDialog)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors bg-purple-100"
                        title="Insert Table"
                      >
                        <Table className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>

                    {/* Image Picker */}
                    {showImagePicker && (
                      <div className="mt-3 p-4 bg-white border border-gray-300 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Select Image from CMS</h4>
                        <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                          {cmsFiles.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => insertImage(file.url)}
                              className="relative group cursor-pointer border-2 border-transparent hover:border-orange-500 rounded-lg overflow-hidden transition-all"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-20 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs">Insert</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Table Configuration Dialog */}
                    {showTableDialog && (
                      <div className="mt-3 p-4 bg-white border border-gray-300 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Insert Table</h4>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-2">Rows</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={tableRows}
                              onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-2">Columns</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={tableColumns}
                              onChange={(e) => setTableColumns(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>
                        </div>

                        {/* Table Preview */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg overflow-x-auto">
                          <p className="text-xs text-gray-600 mb-2">Preview:</p>
                          <table className="border-collapse border border-gray-300 text-xs">
                            <tbody>
                              {Array.from({ length: Math.min(tableRows, 3) }).map((_, i) => (
                                <tr key={i}>
                                  {Array.from({ length: Math.min(tableColumns, 5) }).map((_, j) => (
                                    <td key={j} className={`border border-gray-300 px-2 py-1 ${i === 0 ? 'bg-gray-200 font-semibold' : ''}`}>
                                      {i === 0 ? 'Header' : 'Cell'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {(tableRows > 3 || tableColumns > 5) && (
                            <p className="text-xs text-gray-500 mt-2">
                              {tableRows > 3 && `+${tableRows - 3} more rows`}
                              {tableRows > 3 && tableColumns > 5 && ', '}
                              {tableColumns > 5 && `+${tableColumns - 5} more columns`}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={insertTable}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                          >
                            Insert Table
                          </button>
                          <button
                            onClick={() => setShowTableDialog(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editor Area */}
                  <div
                    ref={contentEditableRef}
                    contentEditable
                    className="min-h-[400px] max-h-[500px] overflow-y-auto p-6 bg-white focus:outline-none"
                    style={{
                      fontSize: currentFontSize,
                      fontFamily: currentFontFamily,
                      lineHeight: '1.6'
                    }}
                    suppressContentEditableWarning
                  >
                    <p className="text-gray-400">Start typing your proposal here or use AI Assistant to generate content...</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">💡 Pro Tips</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Use the formatting toolbar to style your text like a Word document</li>
                    <li>• Insert images directly from your CMS library using the image button</li>
                    <li>• Add tables to present pricing, deliverables, or project timelines</li>
                    <li>• Use headings to organize your proposal into sections</li>
                    <li>• Add bullet points or numbered lists for deliverables and timelines</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProposal}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Proposal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal - Document Style */}
      <AnimatePresence>
        {selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProposal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-950">Proposal Preview</h2>
                    <p className="text-sm text-gray-600">Review and manage proposal</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
                {/* Document Paper Effect */}
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                  {/* Document Header with Proposal Info */}
                  <div className="p-8 border-b-2 border-gray-200">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-blue-950 mb-2">{selectedProposal.title}</h1>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(() => {
                            const sourceBadge = getSourceBadge(selectedProposal.source);
                            const SourceIcon = sourceBadge.icon;
                            const StatusIcon = getStatusIcon(selectedProposal.status);
                            return (
                              <>
                                <span className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 ${sourceBadge.color}`}>
                                  <SourceIcon className="w-3 h-3" />
                                  {sourceBadge.label}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(selectedProposal.status)}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Customer & Proposal Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-gray-50 to-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Customer</div>
                        <div className="flex items-center gap-2 text-blue-950">
                          <User className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{selectedProposal.customer}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</div>
                        <div className="flex items-center gap-2 text-blue-950">
                          <Mail className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{selectedProposal.email}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</div>
                        <div className="flex items-center gap-2 text-blue-950">
                          <Phone className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{selectedProposal.phone}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Created Date</div>
                        <div className="flex items-center gap-2 text-blue-950">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{selectedProposal.created}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Proposal Amount</div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            ${selectedProposal.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Content - Document Body */}
                  <div className="p-8">
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span className="uppercase tracking-wider">Proposal Content</span>
                    </div>

                    <div
                      className="prose prose-sm max-w-none text-gray-800"
                      style={{
                        lineHeight: '1.8',
                        fontSize: '16px'
                      }}
                    >
                      {selectedProposal.content.includes('<') ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedProposal.content }}
                          className="rich-content"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {selectedProposal.content}
                        </div>
                      )}
                    </div>

                    {/* Conversation Link if applicable */}
                    {selectedProposal.conversationId && (
                      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-900 font-medium">
                            This proposal was generated from conversation ID: {selectedProposal.conversationId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-white flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedProposal.sentDate && (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-green-600" />
                      <span>Sent on {selectedProposal.sentDate}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => alert('Edit proposal')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => alert('Download PDF')}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  {selectedProposal.status === 'draft' && (
                    <button
                      onClick={() => alert(`Sending to ${selectedProposal.customer}`)}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <Send className="w-4 h-4" />
                      Send Proposal
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
