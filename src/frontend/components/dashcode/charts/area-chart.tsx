"use client"

/**
 * DashCode Area Chart Component
 *
 * Responsive area chart using Recharts for analytics dashboards.
 * Features gradients, tooltips, and responsive design.
 *
 * @example
 * ```tsx
 * <AreaChartComponent
 *   data={monthlyData}
 *   dataKey="revenue"
 *   xAxisKey="month"
 *   title="Monthly Revenue"
 *   color="#8B5CF6"
 * />
 * ```
 */

import * as React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface AreaChartData {
  [key: string]: string | number
}

export interface AreaChartComponentProps {
  /** Chart data */
  data: AreaChartData[]

  /** Key for Y-axis data */
  dataKey: string

  /** Key for X-axis data */
  xAxisKey: string

  /** Chart title */
  title?: string

  /** Chart description */
  description?: string

  /** Primary color */
  color?: string

  /** Custom className */
  className?: string

  /** Chart height */
  height?: number

  /** Format value (e.g., currency, percentage) */
  valueFormatter?: (value: number) => string

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
    const value = payload[0].value
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          {valueFormatter ? valueFormatter(value) : value}
        </p>
      </div>
    )
  }
  return null
}

export function AreaChartComponent({
  data,
  dataKey,
  xAxisKey,
  title,
  description,
  color = "#8B5CF6",
  className,
  height = 300,
  valueFormatter,
  isLoading = false,
}: AreaChartComponentProps) {
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
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
