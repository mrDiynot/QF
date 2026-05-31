'use client';

import { motion } from 'motion/react';
import {
  Globe, Mail, MessageCircle, QrCode, Phone, Instagram,
  Facebook, CheckCircle, Settings, Plus, BarChart2, Copy,
  ExternalLink, Eye
} from 'lucide-react';

export default function OmnichannelLeadCapturePage() {
  const channels = [
    {
      name: 'Web Chat Widget',
      icon: Globe,
      status: 'active',
      leads: 342,
      color: 'from-blue-500 to-cyan-600',
      description: 'Embedded chat on your website'
    },
    {
      name: 'Contact Forms',
      icon: Mail,
      status: 'active',
      leads: 198,
      color: 'from-green-500 to-emerald-600',
      description: 'Lead capture forms on landing pages'
    },
    {
      name: 'SMS/Text',
      icon: MessageCircle,
      status: 'active',
      leads: 156,
      color: 'from-purple-500 to-violet-600',
      description: 'Two-way SMS conversations'
    },
    {
      name: 'QR Codes',
      icon: QrCode,
      status: 'active',
      leads: 89,
      color: 'from-pink-500 to-rose-600',
      description: 'Scannable codes for instant contact'
    },
    {
      name: 'Phone/Voice',
      icon: Phone,
      status: 'active',
      leads: 234,
      color: 'from-orange-500 to-red-600',
      description: 'AI voice calls and missed call capture'
    },
    {
      name: 'Instagram DMs',
      icon: Instagram,
      status: 'active',
      leads: 167,
      color: 'from-fuchsia-500 to-purple-600',
      description: 'Automated Instagram messaging'
    },
    {
      name: 'Facebook Messenger',
      icon: Facebook,
      status: 'active',
      leads: 143,
      color: 'from-blue-600 to-indigo-600',
      description: 'Facebook page conversations'
    },
    {
      name: 'Email Capture',
      icon: Mail,
      status: 'active',
      leads: 276,
      color: 'from-teal-500 to-cyan-600',
      description: 'Newsletter and email campaigns'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Omnichannel Lead Capture</h1>
        <p className="text-gray-600">Capture leads from every channel automatically &mdash; all in one system</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="text-3xl font-semibold text-gray-900 mb-1">1,605</div>
          <div className="text-sm text-gray-600">Total Leads This Month</div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="text-3xl font-semibold text-green-600 mb-1">8</div>
          <div className="text-sm text-gray-600">Active Channels</div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="text-3xl font-semibold text-gray-900 mb-1">94%</div>
          <div className="text-sm text-gray-600">Capture Rate</div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="text-3xl font-semibold text-gray-900 mb-1">12s</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{channel.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">{channel.leads}</div>
                  <div className="text-xs text-gray-500">leads captured</div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Setup Widgets */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Web Chat Widget Setup */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Web Chat Widget
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Add this code to your website to enable the QualiFlow chat widget
          </p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-sm text-green-400 font-mono">
              {'<script src="https://qualiflow.ai/widget.js" data-id="your-id"></script>'}
            </code>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* QR Code Generator */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Generator
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Create QR codes for instant lead capture from physical locations
          </p>
          <div className="bg-gray-50 rounded-lg p-8 mb-4 flex items-center justify-center">
            <div className="w-32 h-32 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center">
              <QrCode className="w-20 h-20 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Generate New
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm font-medium">
              <ExternalLink className="w-4 h-4" />
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="mt-6 bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
          <button className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            View Analytics
          </button>
        </div>
        <div className="space-y-4">
          {channels.slice(0, 5).map((channel, index) => {
            const percentage = (channel.leads / 1605) * 100;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{channel.name}</span>
                  <span className="text-sm font-medium text-gray-900">{channel.leads} leads ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${channel.color} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
