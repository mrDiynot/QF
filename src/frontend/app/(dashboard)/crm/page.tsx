'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users, Search, Filter, Plus, Mail, Phone, MessageSquare,
  Calendar, Tag, Star, TrendingUp, CheckCircle, Clock,
  MoreVertical, Eye, Edit, Trash2, Download, UserCheck, Bot
} from 'lucide-react';

export default function CRMPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [filterAssigned, setFilterAssigned] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleExportExcel = () => {
    alert('Exporting leads to Excel...');
  };

  // Team Members for assignment
  const teamMembers = [
    { id: 'sarah-sales', name: 'Sarah Miller', role: 'Sales Manager', avatar: 'SM', available: true },
    { id: 'john-sales', name: 'John Davis', role: 'Sales Rep', avatar: 'JD', available: true },
    { id: 'mike-pm', name: 'Mike Thompson', role: 'Project Manager', avatar: 'MT', available: false },
    { id: 'emma-pm', name: 'Emma Wilson', role: 'Project Manager', avatar: 'EW', available: true },
    { id: 'alex-sales', name: 'Alex Rodriguez', role: 'Sales Rep', avatar: 'AR', available: true },
  ];

  const aiLists = [
    { name: 'Hot Leads', count: 47, color: 'bg-red-500', icon: '🔥' },
    { name: 'Warm Leads', count: 183, color: 'bg-yellow-500', icon: '☀️' },
    { name: 'Cold Leads', count: 145, color: 'bg-blue-500', icon: '❄️' },
    { name: 'Review Ready', count: 64, color: 'bg-green-500', icon: '⭐' },
    { name: 'Qualified', count: 128, color: 'bg-emerald-500', icon: '✅' },
    { name: 'VIP Customers', count: 29, color: 'bg-purple-500', icon: '👑' },
    { name: 'Upsell Opportunities', count: 56, color: 'bg-orange-500', icon: '💰' },
    { name: 'At-Risk Customers', count: 18, color: 'bg-pink-500', icon: '⚠️' },
    { name: 'Monthly Re-engagement', count: 92, color: 'bg-teal-500', icon: '🔄' }
  ];

  const contacts = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      score: 94,
      status: 'Hot',
      tags: ['Emergency', 'High Value'],
      lastContact: '2 mins ago',
      stage: 'Qualification',
      source: 'Web Chat',
      assignedTo: 'sarah-sales',
      assignedBy: 'AI'
    },
    {
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1 (555) 234-5678',
      score: 87,
      status: 'Warm',
      tags: ['Interested', 'Follow-up'],
      lastContact: '15 mins ago',
      stage: 'Booking',
      source: 'Facebook',
      assignedTo: 'john-sales',
      assignedBy: 'Manual'
    },
    {
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      phone: '+1 (555) 345-6789',
      score: 92,
      status: 'Hot',
      tags: ['VIP', 'Urgent'],
      lastContact: '32 mins ago',
      stage: 'Booked',
      source: 'Phone',
      assignedTo: 'mike-pm',
      assignedBy: 'AI'
    },
    {
      name: 'James Wilson',
      email: 'j.wilson@email.com',
      phone: '+1 (555) 456-7890',
      score: 76,
      status: 'Warm',
      tags: ['Research Phase'],
      lastContact: '1 hour ago',
      stage: 'Nurture',
      source: 'Instagram',
      assignedTo: 'alex-sales',
      assignedBy: 'AI'
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      phone: '+1 (555) 567-8901',
      score: 88,
      status: 'Hot',
      tags: ['Ready to Book', 'High Value'],
      lastContact: '2 hours ago',
      stage: 'Qualification',
      source: 'SMS',
      assignedTo: 'emma-pm',
      assignedBy: 'Manual'
    }
  ];

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contact.status.toLowerCase() === filterStatus;
    const matchesAssigned = filterAssigned === 'all' || contact.assignedTo === filterAssigned;
    return matchesSearch && matchesStatus && matchesAssigned;
  });

  const handleAssignmentChange = (contactIndex: number, newAssignee: string) => {
    alert(`Assigning ${contacts[contactIndex].name} to ${teamMembers.find(m => m.id === newAssignee)?.name}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">CRM &amp; Contacts</h1>
          <p className="text-gray-600">AI-powered contact management with automatic segmentation and insights</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* AI Smart Lists */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg text-blue-950 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            AI Smart Lists
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Automatically created and maintained by AI
          </p>
          <div className="space-y-2">
            {aiLists.map((list, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-left"
              >
                <div className="text-xl">{list.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{list.name}</div>
                </div>
                <div className="px-2 py-1 bg-white rounded-full text-xs text-gray-700">
                  {list.count}
                </div>
              </motion.button>
            ))}
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Create Custom List
          </button>
        </div>

        {/* Contacts Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-xs border border-gray-200">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-blue-950 flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Contacts
              </h3>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {([
                { id: 'all' as const, label: 'All Contacts', count: 664 },
                { id: 'hot' as const, label: 'Hot', count: 47 },
                { id: 'warm' as const, label: 'Warm', count: 183 },
                { id: 'cold' as const, label: 'Cold', count: 145 }
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Filter Menu */}
            {showFilterMenu && (
              <div className="absolute right-6 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-64">
                <div className="p-4">
                  <h4 className="text-sm text-gray-700 mb-2">Status</h4>
                  <div className="space-y-1">
                    {(['all', 'hot', 'warm', 'cold'] as const).map((status) => (
                      <button
                        key={status}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-all ${
                          filterStatus === status
                            ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setFilterStatus(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <h4 className="text-sm text-gray-700 mb-2">Assigned To</h4>
                  <div className="space-y-1">
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-sm transition-all ${
                        filterAssigned === 'all'
                          ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setFilterAssigned('all')}
                    >
                      All
                    </button>
                    {teamMembers.map(member => (
                      <button
                        key={member.id}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-all text-left ${
                          filterAssigned === member.id
                            ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setFilterAssigned(member.id)}
                      >
                        {member.name} ({member.role})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact List */}
          <div className="p-6">
            <div className="space-y-3">
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => setSelectedContact(selectedContact === index ? null : index)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shrink-0">
                      <span className="text-white">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-blue-950">{contact.name}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          contact.status === 'Hot'
                            ? 'bg-red-100 text-red-700'
                            : contact.status === 'Warm'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {contact.status}
                        </span>
                        <div className="text-sm text-gray-600">
                          Score: <span className="text-blue-950">{contact.score}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {contact.lastContact}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {contact.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {contact.stage}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {contact.source}
                        </span>
                      </div>

                      {/* Assignment Section */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-2">
                          {contact.assignedBy === 'AI' ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                              <Bot className="w-3 h-3" />
                              <span>AI Assigned</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                              <UserCheck className="w-3 h-3" />
                              <span>Manually Assigned</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">to</div>
                        <select
                          className="px-3 py-1 border border-gray-300 rounded-lg text-xs bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={contact.assignedTo}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleAssignmentChange(index, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Schedule Call"
                      >
                        <Phone className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Book Appointment"
                      >
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>

                  {/* Detailed Expanded View */}
                  {selectedContact === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-300"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Contact Statistics */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              Contact Activity
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl text-blue-950 mb-1">24</div>
                                <div className="text-xs text-gray-600">🤖 AI Contacts</div>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl text-blue-950 mb-1">8</div>
                                <div className="text-xs text-gray-600">👤 Manual Contacts</div>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl text-blue-950 mb-1">15</div>
                                <div className="text-xs text-gray-600">📧 Emails Sent</div>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl text-blue-950 mb-1">6</div>
                                <div className="text-xs text-gray-600">📞 Calls Made</div>
                              </div>
                            </div>
                          </div>

                          {/* Editable Contact Info */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm text-gray-700 flex items-center gap-2">
                                <Edit className="w-4 h-4 text-blue-600" />
                                Contact Information
                              </h4>
                              <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-gray-600">Full Name</label>
                                <input
                                  type="text"
                                  defaultValue={contact.name}
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Email</label>
                                <input
                                  type="email"
                                  defaultValue={contact.email}
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Phone</label>
                                <input
                                  type="tel"
                                  defaultValue={contact.phone}
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Company</label>
                                <input
                                  type="text"
                                  defaultValue="Tech Solutions Inc"
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Deal Value</label>
                                <input
                                  type="text"
                                  defaultValue="$12,500"
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Journey Progress */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              Customer Journey
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <div className="flex-1">
                                  <div className="text-sm text-gray-900">Lead Captured</div>
                                  <div className="text-xs text-gray-500">Completed - 3 days ago</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <div className="flex-1">
                                  <div className="text-sm text-gray-900">Qualification Call</div>
                                  <div className="text-xs text-gray-500">Completed - 2 days ago</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-900">Demo Scheduled</div>
                                  <div className="text-xs text-orange-600">In Progress - Tomorrow 2pm</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-400">Proposal Sent</div>
                                  <div className="text-xs text-gray-400">Pending</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-400">Closed Deal</div>
                                  <div className="text-xs text-gray-400">Pending</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          {/* Timeline */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              Recent Activity
                            </h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                                <div>
                                  <div className="text-gray-900">AI sent follow-up email</div>
                                  <div className="text-xs text-gray-500">2 hours ago</div>
                                </div>
                              </div>
                              <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                                <div>
                                  <div className="text-gray-900">You scheduled a demo call</div>
                                  <div className="text-xs text-gray-500">5 hours ago</div>
                                </div>
                              </div>
                              <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                                <div>
                                  <div className="text-gray-900">Contact opened pricing email</div>
                                  <div className="text-xs text-gray-500">Yesterday 3:45 PM</div>
                                </div>
                              </div>
                              <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0"></div>
                                <div>
                                  <div className="text-gray-900">AI completed qualification call</div>
                                  <div className="text-xs text-gray-500">2 days ago</div>
                                </div>
                              </div>
                              <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                                <div>
                                  <div className="text-gray-900">Lead captured from website</div>
                                  <div className="text-xs text-gray-500">3 days ago</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                              📝 Notes
                            </h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="text-xs text-gray-600">You - 2 hours ago</div>
                                  <button className="text-xs text-blue-600">Edit</button>
                                </div>
                                <div className="text-sm text-gray-900">Very interested in enterprise plan. Wants custom integration with Salesforce. Follow up after demo.</div>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="text-xs text-gray-600">AI Assistant - 5 hours ago</div>
                                </div>
                                <div className="text-sm text-gray-900">Contact mentioned budget of $15k-20k annually. Preferred start date: Next quarter.</div>
                              </div>
                              <textarea
                                placeholder="Add a new note..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={3}
                              />
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all">
                                Save Note
                              </button>
                            </div>
                          </div>

                          {/* Sales Prospect Details */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                              💼 Sales Details
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-gray-600">Lead Source</label>
                                <div className="text-sm text-gray-900 mt-1">{contact.source}</div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Sales Stage</label>
                                <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={contact.stage}>
                                  <option>{contact.stage}</option>
                                  <option>New Lead</option>
                                  <option>Contacted</option>
                                  <option>Qualified</option>
                                  <option>Demo Scheduled</option>
                                  <option>Proposal Sent</option>
                                  <option>Negotiation</option>
                                  <option>Closed Won</option>
                                  <option>Closed Lost</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Expected Close Date</label>
                                <input
                                  type="date"
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Probability to Close</label>
                                <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                  <option>75% - High</option>
                                  <option>50% - Medium</option>
                                  <option>25% - Low</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-300">
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                          Save Changes
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                          Send Email
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                          Schedule Call
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                          Export to PDF
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <button className="mt-6 w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all">
              Load More Contacts
            </button>
          </div>
        </div>
      </div>

      {/* CRM Stats */}
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl mb-1">664</div>
              <div className="text-sm text-blue-100">Total Contacts</div>
              <div className="text-sm text-blue-200 mt-2">+47 this week</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl mb-1">230</div>
              <div className="text-sm text-green-100">Engaged This Week</div>
              <div className="text-sm text-green-200 mt-2">35% engagement rate</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl mb-1">8</div>
              <div className="text-sm text-purple-100">AI Smart Lists</div>
              <div className="text-sm text-purple-200 mt-2">Auto-updated daily</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
