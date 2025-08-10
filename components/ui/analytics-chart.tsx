"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from "recharts"
import {
  MoreHorizontal,
  Download,
  Maximize2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChartIcon,
  PieChartIcon,
} from "lucide-react"
import { motion } from "framer-motion"

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6b7280",
]

interface AnalyticsChartProps {
  title: string
  description?: string
  data: any[]
  type: "line" | "area" | "bar" | "pie" | "composed"
  dataKeys: string[]
  xAxisKey: string
  height?: number
  showLegend?: boolean
  showTrend?: boolean
  trendValue?: number
  formatValue?: (value: any) => string
  onExport?: () => void
  onExpand?: () => void
  className?: string
}

export function AnalyticsChart({
  title,
  description,
  data,
  type,
  dataKeys,
  xAxisKey,
  height = 300,
  showLegend = false,
  showTrend = false,
  trendValue,
  formatValue = (value) => value?.toString() || "",
  onExport,
  onExpand,
  className,
}: AnalyticsChartProps) {
  const [chartType, setChartType] = useState(type)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border rounded-lg shadow-lg p-3 backdrop-blur-sm"
        >
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm capitalize">{entry.name}</span>
              </div>
              <span className="text-sm font-medium">{formatValue(entry.value)}</span>
            </div>
          ))}
        </motion.div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={1}
                fill={`url(#color${key})`}
              />
            ))}
          </AreaChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[index % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )

      case "pie":
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey={dataKeys[0]}
              nameKey={xAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        )

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKeys[0]}
              fill={CHART_COLORS[0]}
              stroke={CHART_COLORS[0]}
              fillOpacity={0.3}
            />
            {dataKeys.slice(1).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[(index + 1) % CHART_COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </ComposedChart>
        )

      default:
        return null
    }
  }

  const chartTypeOptions = [
    { value: "line", label: "Line Chart", icon: LineChartIcon },
    { value: "area", label: "Area Chart", icon: BarChart3 },
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "pie", label: "Pie Chart", icon: PieChartIcon },
  ]

  return (
    <Card className={`shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{title}</CardTitle>
              {showTrend && trendValue !== undefined && (
                <Badge variant={trendValue >= 0 ? "default" : "destructive"} className="flex items-center gap-1">
                  {trendValue >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trendValue >= 0 ? "+" : ""}
                  {trendValue.toFixed(1)}%
                </Badge>
              )}
            </div>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {chartTypeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setChartType(option.value as any)}
                    className={chartType === option.value ? "bg-accent" : ""}
                  >
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </DropdownMenuItem>
                )}
                {onExpand && (
                  <DropdownMenuItem onClick={onExpand}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          key={chartType}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  )
}
