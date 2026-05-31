'use client';

import { motion } from 'motion/react';
import {
  TrendingUp, Target, Award, Package,
  Clock, ArrowUpRight, Sparkles, BarChart3,
  MessageSquare, Zap, AlertCircle, Calendar,
  Search, RefreshCw,
  Repeat, Star, TrendingDown
} from 'lucide-react';

export default function AdvancedAnalyticsPage() {
  // Demand Intelligence
  const demandTrends = [
    { service: 'Teeth Whitening', requests: 847, trend: 'up', change: '+18%' },
    { service: 'General Cleaning', requests: 1234, trend: 'up', change: '+12%' },
    { service: 'Dental Implants', requests: 456, trend: 'up', change: '+25%' },
    { service: 'Root Canal', requests: 234, trend: 'stable', change: '+2%' },
    { service: 'Orthodontics', requests: 567, trend: 'up', change: '+31%' }
  ];

  // Channel Lead Quality
  const channelQuality = [
    { channel: 'Web Chat', leads: 456, qualificationRate: 87, avgScore: 92 },
    { channel: 'Phone', leads: 342, qualificationRate: 78, avgScore: 84 },
    { channel: 'Facebook', leads: 289, qualificationRate: 64, avgScore: 71 },
    { channel: 'Instagram', leads: 234, qualificationRate: 58, avgScore: 68 },
    { channel: 'Google Ads', leads: 523, qualificationRate: 72, avgScore: 79 },
    { channel: 'SMS', leads: 187, qualificationRate: 81, avgScore: 86 }
  ];

  // Peak Engagement Times
  const peakEngagement = {
    bestDay: { day: 'Tuesday', leads: 234, engagement: '89%' },
    bestTime: { time: '2:00 PM - 4:00 PM', leads: 178, engagement: '92%' },
    worstDay: { day: 'Sunday', leads: 67, engagement: '54%' },
    worstTime: { time: '8:00 AM - 10:00 AM', leads: 45, engagement: '61%' }
  };

  // Customer Drop-Off Points
  const dropOffPoints = [
    { point: 'After proposal', dropOffs: 147, rate: '23%', recovered: 89 },
    { point: 'After pricing mention', dropOffs: 234, rate: '31%', recovered: 156 },
    { point: 'After qualification question', dropOffs: 89, rate: '12%', recovered: 67 },
    { point: 'After viewing a page', dropOffs: 312, rate: '42%', recovered: 187 },
    { point: 'After initial chat', dropOffs: 198, rate: '26%', recovered: 134 },
    { point: 'After call summary', dropOffs: 76, rate: '9%', recovered: 52 }
  ];

  // Offer & Campaign Sensitivity
  const offerPerformance = [
    { offer: 'Free Consultation', conversions: 423, conversionRate: 68, engagement: '87%' },
    { offer: '20% Off First Visit', conversions: 389, conversionRate: 61, engagement: '79%' },
    { offer: 'New Patient Special', conversions: 456, conversionRate: 72, engagement: '91%' },
    { offer: 'Same-Day Booking Bonus', conversions: 312, conversionRate: 58, engagement: '74%' },
    { offer: 'Referral Discount', conversions: 267, conversionRate: 51, engagement: '68%' }
  ];

  // Customer Frequency & Retention
  const retentionMetrics = {
    oneTimeVisit: { count: 412, percentage: 32 },
    twoVisits: { count: 356, percentage: 28 },
    threeToFive: { count: 289, percentage: 23 },
    sixPlus: { count: 217, percentage: 17 },
    avgFrequency: 2.8,
    retentionRate: '68%'
  };

  // Highest-Converting Service
  const topServices = [
    { service: 'General Cleaning', conversionRate: 84, bookings: 987 },
    { service: 'Teeth Whitening', conversionRate: 79, bookings: 623 },
    { service: 'Root Canal', conversionRate: 76, bookings: 178 },
    { service: 'Dental Implants', conversionRate: 48, bookings: 189 },
    { service: 'Orthodontics', conversionRate: 44, bookings: 234 }
  ];

  // Most Effective Journey
  const journeyPerformance = [
    { journey: 'New Lead \u2192 Qualification \u2192 Booking', completionRate: 87, conversions: 623 },
    { journey: 'Review + Survey Flow', completionRate: 82, conversions: 456 },
    { journey: 'Missed Call Recovery', completionRate: 76, conversions: 289 },
    { journey: 'No-Show Recovery', completionRate: 71, conversions: 187 },
    { journey: 'Cold Lead Revival', completionRate: 64, conversions: 134 }
  ];

  // Services That Create Repeat Business
  const repeatServices = [
    { service: 'General Cleaning', repeatRate: 78, avgReturns: 4.2 },
    { service: 'Teeth Whitening', repeatRate: 56, avgReturns: 2.8 },
    { service: 'Orthodontics', repeatRate: 92, avgReturns: 8.7 },
    { service: 'Dental Implants', repeatRate: 34, avgReturns: 1.9 },
    { service: 'Root Canal', repeatRate: 41, avgReturns: 2.1 }
  ];

  // Most Successful Offers
  const successfulOffers = [
    { offer: 'New Patient Special', bookings: 456, revenue: '$91,200', roi: '1,824%' },
    { offer: 'Free Consultation', bookings: 423, revenue: '$84,600', roi: '1,692%' },
    { offer: '20% Off First Visit', bookings: 389, revenue: '$77,800', roi: '1,556%' },
    { offer: 'Same-Day Booking Bonus', bookings: 312, revenue: '$62,400', roi: '1,248%' },
    { offer: 'Referral Discount', bookings: 267, revenue: '$53,400', roi: '1,068%' }
  ];

  // Keywords Associated With Conversions
  const conversionKeywords = [
    { keyword: 'emergency dental', mentions: 347, conversions: 289, conversionRate: 83 },
    { keyword: 'teeth whitening', mentions: 523, conversions: 412, conversionRate: 79 },
    { keyword: 'same day appointment', mentions: 412, conversions: 318, conversionRate: 77 },
    { keyword: 'dental implants cost', mentions: 289, conversions: 198, conversionRate: 69 },
    { keyword: 'tooth pain', mentions: 456, conversions: 301, conversionRate: 66 },
    { keyword: 'free consultation', mentions: 378, conversions: 234, conversionRate: 62 },
    { keyword: 'accepting new patients', mentions: 267, conversions: 156, conversionRate: 58 }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-orange-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Advanced Analytics</h1>
        </div>
        <p className="text-gray-600">Marketing intelligence and customer journey insights for data-driven optimization</p>
      </div>

      {/* Demand Intelligence */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Demand Intelligence</h2>
        </div>
        <div className="space-y-3 mb-4">
          {demandTrends.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-orange-400' : 'bg-gray-200'
                  }`}></div>
                  <span className="text-sm text-gray-800">{item.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">{item.requests} requests</div>
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                    item.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                    {item.change}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Demand Insight:</strong> &ldquo;Orthodontics&rdquo; shows highest growth (+31%) while &ldquo;Teeth Whitening&rdquo; maintains strong volume.
              Consider increasing capacity for high-growth services and creating bundled offers.
            </div>
          </div>
        </div>
      </div>

      {/* Channel Lead Quality */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Channel Lead Quality</h2>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Channel</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Leads</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Qualification Rate</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Avg Quality Score</th>
              </tr>
            </thead>
            <tbody>
              {channelQuality.map((channel, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-800">{channel.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{channel.leads}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      channel.qualificationRate >= 80 ? 'bg-green-100 text-green-700' :
                      channel.qualificationRate >= 70 ? 'bg-blue-100 text-blue-700' :
                      channel.qualificationRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {channel.qualificationRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      channel.avgScore >= 85 ? 'bg-green-100 text-green-700' :
                      channel.avgScore >= 75 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {channel.avgScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <strong>Channel Optimization:</strong> Web Chat produces highest quality leads (87% qualification, 92 avg score).
              Invest more in live chat capabilities. Phone channel also performs well &mdash; ensure quick response times.
            </div>
          </div>
        </div>
      </div>

      {/* Peak Engagement & Demand Times */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Peak Engagement &amp; Demand Times</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600">Best Day</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">{peakEngagement.bestDay.day}</div>
            <div className="text-xs text-gray-600">{peakEngagement.bestDay.leads} leads &middot; {peakEngagement.bestDay.engagement} engaged</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-gray-600">Best Time</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">{peakEngagement.bestTime.time}</div>
            <div className="text-xs text-gray-600">{peakEngagement.bestTime.leads} leads &middot; {peakEngagement.bestTime.engagement} engaged</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-gray-600">Slowest Day</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">{peakEngagement.worstDay.day}</div>
            <div className="text-xs text-gray-600">{peakEngagement.worstDay.leads} leads &middot; {peakEngagement.worstDay.engagement} engaged</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Slowest Time</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">{peakEngagement.worstTime.time}</div>
            <div className="text-xs text-gray-600">{peakEngagement.worstTime.leads} leads &middot; {peakEngagement.worstTime.engagement} engaged</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-sm text-teal-900">
              <strong>Schedule Optimization:</strong> Launch high-priority campaigns on Tuesdays 2-4 PM for maximum engagement (92%).
              Use off-peak times for retargeting and follow-up campaigns when competition is lower.
            </div>
          </div>
        </div>
      </div>

      {/* Customer Drop-Off & Recovery Insights */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Customer Drop-Off &amp; Recovery Insights</h2>
        </div>
        <div className="space-y-3 mb-4">
          {dropOffPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-800">{point.point}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-600">{point.dropOffs} drop-offs ({point.rate})</span>
                  <span className="text-sm text-green-600">{point.recovered} recovered</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(point.recovered / point.dropOffs) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Recovery rate: {Math.round((point.recovered / point.dropOffs) * 100)}%
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <strong>Recovery Strategy:</strong> &ldquo;After viewing a page&rdquo; shows highest drop-off (42%) &mdash; implement exit-intent popups.
              &ldquo;After pricing mention&rdquo; is critical (31%) &mdash; create value-justification content and financing options messaging.
            </div>
          </div>
        </div>
      </div>

      {/* Offer & Campaign Sensitivity */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">Offer &amp; Campaign Sensitivity</h2>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Offer</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Conversions</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Conversion Rate</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {offerPerformance.map((offer, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' : 'bg-blue-400'
                      }`}></div>
                      <span className="text-sm text-gray-800">{offer.offer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{offer.conversions}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      offer.conversionRate >= 70 ? 'bg-green-100 text-green-700' :
                      offer.conversionRate >= 60 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {offer.conversionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-blue-600">{offer.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong>Offer Insight:</strong> &ldquo;New Patient Special&rdquo; drives highest conversions (72%) with strong engagement (91%).
              &ldquo;Same-Day Booking Bonus&rdquo; creates urgency &mdash; use for last-minute availability.
            </div>
          </div>
        </div>
      </div>

      {/* Customer Frequency & Retention */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Repeat className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Customer Frequency &amp; Retention</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{retentionMetrics.oneTimeVisit.count}</div>
            <div className="text-xs text-gray-600 mb-2">One-Time Visits</div>
            <div className="text-sm text-gray-500">{retentionMetrics.oneTimeVisit.percentage}%</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{retentionMetrics.twoVisits.count}</div>
            <div className="text-xs text-gray-600 mb-2">Two Visits</div>
            <div className="text-sm text-gray-500">{retentionMetrics.twoVisits.percentage}%</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{retentionMetrics.threeToFive.count}</div>
            <div className="text-xs text-gray-600 mb-2">3-5 Visits</div>
            <div className="text-sm text-gray-500">{retentionMetrics.threeToFive.percentage}%</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{retentionMetrics.sixPlus.count}</div>
            <div className="text-xs text-gray-600 mb-2">6+ Visits</div>
            <div className="text-sm text-gray-500">{retentionMetrics.sixPlus.percentage}%</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
            <div className="text-3xl font-semibold text-gray-900 mb-1">{retentionMetrics.avgFrequency}</div>
            <div className="text-sm text-gray-600">Average Visit Frequency</div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
            <div className="text-3xl font-semibold text-gray-900 mb-1">{retentionMetrics.retentionRate}</div>
            <div className="text-sm text-gray-600">Overall Retention Rate</div>
          </div>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-start gap-3">
            <Repeat className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <strong>Retention Strategy:</strong> 32% are one-time visitors &mdash; implement 30-day follow-up campaigns.
              Focus on converting 2-visit customers to 3+ visits where loyalty increases significantly.
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Highest-Converting Service */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Highest-Converting Services</h2>
          </div>
          <div className="space-y-3">
            {topServices.map((service, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                      index === 0 ? 'from-yellow-400 to-orange-500' :
                      index === 1 ? 'from-gray-300 to-gray-400' :
                      index === 2 ? 'from-orange-400 to-red-500' :
                      'from-gray-200 to-gray-300'
                    } flex items-center justify-center text-white text-xs`}>
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-800">{service.service}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    service.conversionRate >= 75 ? 'bg-green-100 text-green-700' :
                    service.conversionRate >= 60 ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {service.conversionRate}% conv.
                  </span>
                </div>
                <div className="text-xs text-gray-600">{service.bookings} bookings</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-900">
              <strong>Top Performer:</strong> General Cleaning at 84% conversion rate
            </div>
          </div>
        </div>

        {/* Most Effective Journey */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Most Effective Journeys</h2>
          </div>
          <div className="space-y-3">
            {journeyPerformance.map((journey, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <span className="text-sm text-gray-800 block mb-1">{journey.journey}</span>
                    <span className="text-xs text-gray-600">{journey.conversions} conversions</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    journey.completionRate >= 85 ? 'bg-green-100 text-green-700' :
                    journey.completionRate >= 75 ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {journey.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${journey.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-900">
              <strong>Best Journey:</strong> New Lead &rarr; Qualification &rarr; Booking at 87%
            </div>
          </div>
        </div>
      </div>

      {/* Services That Create Repeat Business */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-6 h-6 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Services That Create Repeat Business</h2>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Service</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Repeat Rate</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Avg Returns</th>
              </tr>
            </thead>
            <tbody>
              {repeatServices.map((service, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-800">{service.service}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      service.repeatRate >= 75 ? 'bg-green-100 text-green-700' :
                      service.repeatRate >= 50 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {service.repeatRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{service.avgReturns}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-start gap-3">
            <Repeat className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-sm text-teal-900">
              <strong>Loyalty Driver:</strong> Orthodontics creates strongest loyalty (92% repeat, 8.7 avg returns).
              General Cleaning also drives consistent returns (78%, 4.2x) &mdash; ensure booking reminders are active.
            </div>
          </div>
        </div>
      </div>

      {/* Most Successful Offers */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Most Successful Offers</h2>
        </div>
        <div className="space-y-3">
          {successfulOffers.map((offer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                    index === 0 ? 'from-yellow-400 to-orange-500' :
                    index === 1 ? 'from-gray-300 to-gray-400' :
                    index === 2 ? 'from-orange-400 to-red-500' :
                    'from-blue-400 to-indigo-500'
                  } flex items-center justify-center text-white text-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm text-gray-800">{offer.offer}</div>
                    <div className="text-xs text-gray-600">{offer.bookings} bookings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">{offer.roi}</div>
                  <div className="text-xs text-gray-600">ROI</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              <strong>Offer Performance:</strong> &ldquo;New Patient Special&rdquo; leads with 1,824% ROI and 456 bookings.
              All offers show strong ROI &mdash; rotate offers quarterly to maintain freshness.
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Associated With Conversions */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Keywords Associated With Conversions</h2>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Keyword</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Mentions</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Conversions</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {conversionKeywords.map((keyword, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-800">&ldquo;{keyword.keyword}&rdquo;</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{keyword.mentions}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{keyword.conversions}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      keyword.conversionRate >= 75 ? 'bg-green-100 text-green-700' :
                      keyword.conversionRate >= 65 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {keyword.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <strong>SEO &amp; Content Strategy:</strong> &ldquo;Emergency dental&rdquo; (83% conv.) and &ldquo;same day appointment&rdquo; (77% conv.)
              show high intent &mdash; optimize landing pages and ad copy for these terms. Create urgency-focused content.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
