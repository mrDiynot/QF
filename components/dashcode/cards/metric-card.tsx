"use client"

/**
 * DashCode Metric Card Component
 *
 * Modern metric/stats card with icon, value, trend, and description.
 * Used for dashboard KPIs and analytics displays.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Revenue"
 *   value="$12,450"
 *   trend={{ value: 12.5, isPositive: true }}
 *   icon={<DollarSign className="h-5 w-5" />}
 *   description="vs last month"
 * />
 * ```
 */

import * as React from "react"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  /** Card title/label */
  title: string

  /** Main metric value */
  value: string | number

  /** Optional trend indicator */
  trend?: {
    value: number
    isPositive: boolean
  }

  /** Optional icon */
  icon?: React.ReactNode | LucideIcon

  /** Optional description/subtitle */
  description?: string

  /** Custom className */
  className?: string

  /** Color variant */
  variant?: "default" | "purple" | "blue" | "green" | "orange" | "red"

  /** Loading state */
  isLoading?: boolean
}

const variantStyles = {
  default: {
    card: "border-border bg-white",
    icon: "bg-muted/40 text-muted-foreground",
    title: "text-muted-foreground",
    value: "text-foreground",
  },
  purple: {
    card: "border-primary/20 bg-gradient-to-br from-purple-50 to-white",
    icon: "bg-primary/10 text-primary",
    title: "text-primary",
    value: "text-foreground",
  },
  blue: {
    card: "border-border bg-gradient-to-br from-blue-50 to-white",
    icon: "bg-muted/50 text-info",
    title: "text-info",
    value: "text-blue-900",
  },
  green: {
    card: "border-green-200 bg-gradient-to-br from-green-50 to-white",
    icon: "bg-green-100 text-green-600",
    title: "text-green-600",
    value: "text-green-900",
  },
  orange: {
    card: "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
    icon: "bg-orange-100 text-orange-600",
    title: "text-orange-600",
    value: "text-orange-900",
  },
  red: {
    card: "border-red-200 bg-gradient-to-br from-red-50 to-white",
    icon: "bg-red-100 text-red-600",
    title: "text-red-600",
    value: "text-red-900",
  },
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
  description,
  className,
  variant = "default",
  isLoading = false,
}: MetricCardProps) {
  const styles = variantStyles[variant]

  // Render icon (handle both ReactNode and LucideIcon component)
  const renderIcon = () => {
    if (!icon) return null

    // Check if it's a component (function/class)
    if (typeof icon === 'function') {
      const IconComponent = icon as LucideIcon
      return <IconComponent className="h-5 w-5" />
    }

    // It's already a ReactNode
    return icon
  }

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", styles.card, className)}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      styles.card,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Title */}
            <p className={cn("text-sm font-medium", styles.title)}>
              {title}
            </p>

            {/* Value */}
            <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
              {value}
            </p>

            {/* Trend & Description */}
            <div className="flex items-center gap-2">
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Icon */}
          {icon && (
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              styles.icon
            )}>
              {renderIcon()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * MetricCardSkeleton - Loading state placeholder
 */
export function MetricCardSkeleton({ className }: { className?: string }) {
  return <MetricCard title="" value="" isLoading className={className} />
}
