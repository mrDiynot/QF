"use client"

/**
 * DashCode Bar Chart Component
 *
 * Responsive bar chart using Recharts for analytics dashboards.
 * Supports multiple bars, custom colors, and tooltips.
 *
 * @example
 * ```tsx
 * <BarChartComponent
 *   data={salesData}
 *   bars={[
 *     { dataKey: "sales", fill: "#8B5CF6", name: "Sales" },
 *     { dataKey: "costs", fill: "#EC4899", name: "Costs" }
 *   ]}
 *   xAxisKey="month"
 *   title="Sales vs Costs"
 * />
 * ```
 */

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface BarChartData {
  [key: string]: string | number
}

export interface BarConfig {
  dataKey: string
  fill: string
  name?: string
}

export interface BarChartComponentProps {
  /** Chart data */
  data: BarChartData[]

  /** Bar configurations */
  bars: BarConfig[]

  /** Key for X-axis data */
  xAxisKey: string

  /** Chart title */
  title?: string

  /** Chart description */
  description?: string

  /** Custom className */
  className?: string

  /** Chart height */
  height?: number

  /** Format value (e.g., currency, percentage) */
  valueFormatter?: (value: number) => string

  /** Show legend */
  showLegend?: boolean

  /** Loading state */
  isLoading?: boolean
}

/**
 * Custom tooltip component
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color?: string
    name?: string
  }>
  label?: string
  valueFormatter?: (value: number) => string
}

function CustomTooltip({ active, payload, label, valueFormatter }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function BarChartComponent({
  data,
  bars,
  xAxisKey,
  title,
  description,
  className,
  height = 300,
  valueFormatter,
  showLegend = true,
  isLoading = false,
}: BarChartComponentProps) {
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          {title && <div className="h-6 bg-muted rounded w-1/3"></div>}
          {description && <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>}
        </CardHeader>
        <CardContent>
          <div style={{ height }} className="bg-muted/40 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
            />
            <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
              />
            )}
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name || bar.dataKey}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
