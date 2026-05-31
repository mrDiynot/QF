'use client';

import { motion } from 'motion/react';
import {
  BarChart3, TrendingUp, Users, Calendar, Phone, Star,
  MessageSquare, Target, DollarSign, ArrowUpRight, ArrowDownRight,
  Mail, Send, MousePointerClick, FileText, ClipboardList, Eye,
  Download, FileDown
} from 'lucide-react';

export default function AnalyticsPage() {
  const handleExportPDF = () => {
    alert('Exporting analytics report as PDF...');
  };

  const handleExportPPT = () => {
    alert('Exporting analytics report as PowerPoint...');
  };

  const kpiStats = [
    {
      label: 'Total Leads',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Conversion Rate',
      value: '32.4%',
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Appointments',
      value: '384',
      change: '+8.2%',
      trend: 'up',
      icon: Calendar,
      color: 'from-purple-500 to-violet-600'
    },
    {
      label: 'Revenue Impact',
      value: '$127K',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-orange-500 to-pink-600'
    }
  ];

  const channelPerformance = [
    { channel: 'Web Chat', leads: 342, conversion: 38, color: 'from-blue-500 to-cyan-600' },
    { channel: 'Phone', leads: 234, conversion: 42, color: 'from-green-500 to-emerald-600' },
    { channel: 'Contact Forms', leads: 198, conversion: 35, color: 'from-purple-500 to-violet-600' },
    { channel: 'Instagram', leads: 167, conversion: 28, color: 'from-pink-500 to-rose-600' },
    { channel: 'SMS', leads: 156, conversion: 31, color: 'from-orange-500 to-yellow-600' }
  ];

  const journeyMetrics = [
    { journey: 'New Lead \u2192 Booking', conversions: 234, rate: 72, revenue: '$47K' },
    { journey: 'Missed Call Recovery', conversions: 89, rate: 64, revenue: '$18K' },
    { journey: 'No-Show Recovery', conversions: 45, rate: 58, revenue: '$9K' },
    { journey: 'Review Collection', conversions: 156, rate: 85, revenue: 'N/A' },
    { journey: 'Cold Lead Revival', conversions: 67, rate: 41, revenue: '$13K' }
  ];

  const timelineData = [
    { week: 'Week 1', leads: 280, appointments: 89, reviews: 32 },
    { week: 'Week 2', leads: 310, appointments: 95, reviews: 38 },
    { week: 'Week 3', leads: 325, appointments: 102, reviews: 41 },
    { week: 'Week 4', leads: 332, appointments: 98, reviews: 45 }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics &amp; Reporting</h1>
          <p className="text-gray-600">Comprehensive insights into your customer journey performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <FileDown className="w-5 h-5" />
            Export PDF
          </button>
          <button
            onClick={handleExportPPT}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-5 h-5" />
            Export PPT
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Channel Performance */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Channel Performance
          </h3>
          <div className="space-y-4">
            {channelPerformance.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{item.channel}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">{item.leads} leads</span>
                    <span className="font-medium text-gray-900">{item.conversion}% conv.</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${item.color} h-3 rounded-full transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${item.conversion}%` }}
                  >
                    <span className="text-xs text-white opacity-75">{item.conversion}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Journey Metrics */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Journey Performance
          </h3>
          <div className="space-y-4">
            {journeyMetrics.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">{item.journey}</div>
                  <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full text-xs">
                    {item.rate}% success
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{item.conversions} conversions</span>
                  <span>&bull;</span>
                  <span className="text-green-600">{item.revenue}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Monthly Trends
        </h3>
        <div className="space-y-6">
          {/* Leads */}
          <div>
            <div className="text-sm text-gray-600 mb-3">Leads Generated</div>
            <div className="flex items-end gap-4 h-32">
              {timelineData.map((item, index) => {
                const maxLeads = 350;
                const height = (item.leads / maxLeads) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-cyan-600 rounded-t-lg flex items-start justify-center pt-2">
                        <span className="text-xs text-white">{item.leads}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.week}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appointments */}
          <div>
            <div className="text-sm text-gray-600 mb-3">Appointments Booked</div>
            <div className="flex items-end gap-4 h-32">
              {timelineData.map((item, index) => {
                const maxAppts = 110;
                const height = (item.appointments / maxAppts) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-emerald-600 rounded-t-lg flex items-start justify-center pt-2">
                        <span className="text-xs text-white">{item.appointments}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.week}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="text-sm text-gray-600 mb-3">Reviews Collected</div>
            <div className="flex items-end gap-4 h-32">
              {timelineData.map((item, index) => {
                const maxReviews = 50;
                const height = (item.reviews / maxReviews) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-500 to-pink-600 rounded-t-lg flex items-start justify-center pt-2">
                        <span className="text-xs text-white">{item.reviews}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.week}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Email Analytics */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Performance
        </h3>
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">3,842</div>
            <div className="text-sm text-gray-600">Emails Sent</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">3,654</div>
            <div className="text-sm text-gray-600">Emails Delivered</div>
            <div className="text-xs text-green-600 mt-1">95.1% delivery rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">1,826</div>
            <div className="text-sm text-gray-600">Emails Opened</div>
            <div className="text-xs text-purple-600 mt-1">50.0% open rate</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-3">
              <MousePointerClick className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">547</div>
            <div className="text-sm text-gray-600">Emails Clicked</div>
            <div className="text-xs text-orange-600 mt-1">15.0% click rate</div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Bounce Rate:</span>
              <span className="font-medium text-gray-900 ml-2">4.9%</span>
            </div>
            <div>
              <span className="text-gray-600">Unsubscribe Rate:</span>
              <span className="font-medium text-gray-900 ml-2">0.8%</span>
            </div>
            <div>
              <span className="text-gray-600">Spam Reports:</span>
              <span className="font-medium text-gray-900 ml-2">0.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forms & Surveys Analytics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Forms Performance */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Forms Performance
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Contact Form</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">2,847</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">892</div>
                  <div className="text-xs text-gray-600">Submissions</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '31.3%' }}></div>
              </div>
              <div className="text-xs text-gray-600 text-right">31.3% conversion rate</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Appointment Request</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">1,923</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">673</div>
                  <div className="text-xs text-gray-600">Submissions</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <div className="text-xs text-gray-600 text-right">35.0% conversion rate</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Newsletter Signup</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">4,156</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">1,038</div>
                  <div className="text-xs text-gray-600">Submissions</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="text-xs text-gray-600 text-right">25.0% conversion rate</div>
            </div>
          </div>
        </div>

        {/* Surveys Performance */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Surveys Performance
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Post-Appointment Survey</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">384</div>
                  <div className="text-xs text-gray-600">Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">276</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full" style={{ width: '71.9%' }}></div>
              </div>
              <div className="text-xs text-gray-600 text-right">71.9% completion rate</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Customer Satisfaction (CSAT)</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">1,247</div>
                  <div className="text-xs text-gray-600">Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">823</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full" style={{ width: '66%' }}></div>
              </div>
              <div className="text-xs text-gray-600 text-right">66.0% completion rate</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Service Feedback</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">567</div>
                  <div className="text-xs text-gray-600">Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">389</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full" style={{ width: '68.6%' }}></div>
              </div>
              <div className="text-xs text-gray-600 text-right">68.6% completion rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-semibold mb-1">892</div>
              <div className="text-sm text-blue-100">AI Calls Made</div>
              <div className="text-sm text-blue-200 mt-2">82% connection rate</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-semibold mb-1">156</div>
              <div className="text-sm text-purple-100">Reviews Collected</div>
              <div className="text-sm text-purple-200 mt-2">4.8 avg rating</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-semibold mb-1">+24%</div>
              <div className="text-sm text-green-100">Growth This Month</div>
              <div className="text-sm text-green-200 mt-2">vs. last month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
