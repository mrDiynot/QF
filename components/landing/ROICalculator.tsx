'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export function ROICalculator() {
  const [monthlyLeads, setMonthlyLeads] = useState(500);
  const [avgDealValue, setAvgDealValue] = useState(5000);
  const [currentConversionRate, setCurrentConversionRate] = useState(15);
  
  // Calculate ROI metrics
  const metrics = useMemo(() => {
    // Industry averages: QualiFlow AI increases conversion by 2-3x, response time reduction by 95%
    const aiConversionRate = Math.min(currentConversionRate * 2.5, 45); // Cap at realistic 45%
    const currentConversions = (monthlyLeads * currentConversionRate) / 100;
    const aiConversions = (monthlyLeads * aiConversionRate) / 100;
    const additionalConversions = aiConversions - currentConversions;
    const additionalRevenue = additionalConversions * avgDealValue;
    const annualAdditionalRevenue = additionalRevenue * 12;
    
    // Cost: Smart Flow @ $199/mo = $2,388/year
    const annualCost = 199 * 12;
    const roi = ((annualAdditionalRevenue - annualCost) / annualCost) * 100;
    
    // Time saved: AI handles 80% of initial qualification (avg 15 min per lead → 3 min)
    const timeSavedPerLead = 12; // minutes
    const totalTimeSavedMonthly = (monthlyLeads * timeSavedPerLead) / 60; // hours
    const totalTimeSavedAnnually = totalTimeSavedMonthly * 12;
    
    return {
      currentConversions: Math.round(currentConversions),
      aiConversions: Math.round(aiConversions),
      additionalConversions: Math.round(additionalConversions),
      monthlyAdditionalRevenue: Math.round(additionalRevenue),
      annualAdditionalRevenue: Math.round(annualAdditionalRevenue),
      roi: Math.round(roi),
      timeSavedMonthly: Math.round(totalTimeSavedMonthly),
      timeSavedAnnually: Math.round(totalTimeSavedAnnually),
      aiConversionRate: Math.round(aiConversionRate)
    };
  }, [monthlyLeads, avgDealValue, currentConversionRate]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Input Controls */}
        <div className="space-y-6">
          <div>
            <h3 className="heading-3 text-foreground mb-2">Calculate Your ROI</h3>
            <p className="body-text text-muted-foreground">
              See how much revenue and time you could save with QualiFlow AI
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-6 space-y-6">
              {/* Monthly Leads */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Monthly Leads
                  </label>
                  <span className="text-lg font-bold text-primary">{monthlyLeads}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50</span>
                  <span>2,000</span>
                </div>
              </div>

              {/* Average Deal Value */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="size-4 text-primary" />
                    Average Deal Value
                  </label>
                  <span className="text-lg font-bold text-primary">${avgDealValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={avgDealValue}
                  onChange={(e) => setAvgDealValue(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$500</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* Current Conversion Rate */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    Current Conversion Rate
                  </label>
                  <span className="text-lg font-bold text-primary">{currentConversionRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={currentConversionRate}
                  onChange={(e) => setCurrentConversionRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5%</span>
                  <span>30%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          <motion.div
            key={metrics.annualAdditionalRevenue}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative p-8 rounded-2xl gradient-brand text-white shadow-brand-lg"
          >
            <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30 hover:bg-white/20">
              <Zap className="size-3 mr-1" />
              ROI Projection
            </Badge>
            
            <div className="mb-6">
              <p className="text-sm text-white/80 mb-1">Annual Additional Revenue</p>
              <p className="text-5xl font-bold">
                ${metrics.annualAdditionalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/80 mb-1">ROI</p>
                <p className="text-2xl font-bold">{metrics.roi.toLocaleString()}%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/80 mb-1">Payback Period</p>
                <p className="text-2xl font-bold">&lt; 1 mo</p>
              </div>
            </div>
          </motion.div>

          {/* Conversion Improvement */}
          <Card className="border-2 border-success/20 bg-success-bg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-success-dark flex items-center gap-2">
                <TrendingUp className="size-4" />
                Conversion Rate Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="text-lg font-bold text-foreground">
                  {metrics.currentConversions} deals/mo
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-success-dark font-semibold">With QualiFlow AI</span>
                <span className="text-lg font-bold text-success-dark">
                  {metrics.aiConversions} deals/mo
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-success/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Additional Deals</span>
                  <span className="text-xl font-bold text-success">
                    +{metrics.additionalConversions}/mo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Saved */}
          <Card className="border-2 border-info/20 bg-info-bg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-info-dark flex items-center gap-2">
                <Clock className="size-4" />
                Time Savings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly</span>
                <span className="text-lg font-bold text-info-dark">
                  {metrics.timeSavedMonthly} hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annually</span>
                <span className="text-lg font-bold text-info-dark">
                  {metrics.timeSavedAnnually} hours
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
