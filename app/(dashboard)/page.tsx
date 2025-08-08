"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAnalyticsStore } from "@/store/analyticsStore"
import { useProductStore } from "@/store/productStore"
import { useOrderStore } from "@/store/orderStore"
import { useCustomerStore } from "@/store/customerStore"

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
} from "recharts"

import {
    TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign, AlertTriangle,
    Eye, Star, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw,
    Plus, MoreHorizontal, Calendar, Target, Zap, Activity, Globe, CreditCard, Truck,
    Heart, ShoppingBag, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react'

import { formatCurrency, formatNumber, formatPercentage, formatRelativeTime, getInitials } from "@/lib/utils"

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
        }
    }
}

const fadeIn = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
}

const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.7,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1]
        }
    }
}

const hoverScale = {
    scale: 1.02,
    transition: {
        duration: 0.2,
        ease: "easeOut"
    }
}

const tapScale = {
    scale: 0.98
}

const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.07,
            duration: 0.3
        }
    })
}

export default function DashboardPage() {
    const session = useSession()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)

    const {
        dashboardData,
        salesAnalytics,
        topSellingProducts,
        customerAnalytics,
        inventoryAnalytics,
        loading,
        error,
        fetchDashboardData,
        fetchSalesAnalytics,
        fetchTopSellingProducts,
        fetchCustomerAnalytics,
        fetchInventoryAnalytics,
    } = useAnalyticsStore()

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    // Load dashboard data
    useEffect(() => {
        const loadData = async () => {
            setIsRefreshing(true)
            try {
                await Promise.all([
                    fetchDashboardData(),
                    fetchSalesAnalytics({ period: "30" }),
                    fetchTopSellingProducts({ period: "30", limit: 5 }),
                    fetchCustomerAnalytics({ period: "30" }),
                    fetchInventoryAnalytics(),
                ])
            } catch (error) {
                console.error("Failed to load dashboard data:", error)
            } finally {
                setIsRefreshing(false)
                setIsFirstLoad(false)
            }
        }

        if (isFirstLoad) {
            loadData()
        }
    }, [isFirstLoad])

    const loadDashboardData = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                fetchDashboardData(),
                fetchSalesAnalytics({ period: "30" }),
                fetchTopSellingProducts({ period: "30", limit: 5 }),
                fetchCustomerAnalytics({ period: "30" }),
                fetchInventoryAnalytics(),
            ])
        } catch (error) {
            console.error("Failed to load dashboard data:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    // Mock data for demonstration
    const recentActivity = [
        { id: 1, type: "order", message: "New order #1234 received", time: "2 minutes ago", status: "success" },
        { id: 2, type: "customer", message: "New customer registered", time: "5 minutes ago", status: "info" },
        { id: 3, type: "inventory", message: "Low stock alert for Product A", time: "10 minutes ago", status: "warning" },
        { id: 4, type: "payment", message: "Payment received for order #1233", time: "15 minutes ago", status: "success" },
    ]

    const quickStats = [
        { label: "Today's Sales", value: formatCurrency(12450), change: "+12.5%", positive: true },
        { label: "Active Sessions", value: "1,234", change: "+5.2%", positive: true },
        { label: "Conversion Rate", value: "3.2%", change: "-0.8%", positive: false },
        { label: "Avg. Order Value", value: formatCurrency(85.50), change: "+8.1%", positive: true },
    ]

    // Calculate growth percentages
    const getGrowthData = (current: number, previous: number = current * 0.85) => {
        const growth = ((current - previous) / previous) * 100
        return {
            value: growth,
            isPositive: growth >= 0,
            formatted: `₹{growth >= 0 ? '+' : ''}₹{growth.toFixed(1)}%`
        }
    }

    const revenueGrowth = getGrowthData(dashboardData?.overview.monthlyRevenue || 0)
    const ordersGrowth = getGrowthData(dashboardData?.overview.totalOrders || 0)
    const customersGrowth = getGrowthData(dashboardData?.overview.totalCustomers || 0)

    // Enhanced Metric Card Component
    const MetricCard = ({
        title,
        value,
        icon: Icon,
        growth,
        description,
        color = "default",
        trend = []
    }: {
        title: string
        value: string | number
        icon: any
        growth?: { value: number; isPositive: boolean; formatted: string }
        description?: string
        color?: "default" | "success" | "warning" | "danger" | "info"
        trend?: number[]
    }) => (
        <motion.div
            // variants={itemVariants}
            // whileHover={hoverScale}
            whileTap={tapScale}
            className="relative"
        >
            <Card className={`relative overflow-hidden transition-all duration-300 ₹{color === "success" ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100/50" :
                color === "warning" ? "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50" :
                    color === "danger" ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50" :
                        color === "info" ? "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50" :
                            "bg-gradient-to-br from-white to-gray-50/50 hover:border-primary/20"
                }`}>
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <Icon className="w-full h-full" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ₹{color === "success" ? "bg-green-100 text-green-600" :
                        color === "warning" ? "bg-orange-100 text-orange-600" :
                            color === "danger" ? "bg-red-100 text-red-600" :
                                color === "info" ? "bg-blue-100 text-blue-600" :
                                    "bg-primary/10 text-primary"
                        }`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold mb-1">{value}</div>
                    {growth && (
                        <div className="flex items-center space-x-1 mb-2">
                            {growth.isPositive ? (
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ₹{growth.isPositive ? "text-green-600" : "text-red-600"
                                }`}>
                                {growth.formatted}
                            </span>
                            <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                    {trend.length > 0 && (
                        <div className="mt-2 h-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend.map((value, index) => ({ value, index }))}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={growth?.isPositive ? "#10b981" : "#ef4444"}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )

    // Custom Chart Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background border rounded-lg shadow-lg p-3 backdrop-blur-sm"
                >
                    <p className="font-medium text-sm">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`₹{entry.name}: ₹{entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('price')
                                ? formatCurrency(entry.value)
                                : formatNumber(entry.value)
                                }`}
                        </p>
                    ))}
                </motion.div>
            )
        }
        return null
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn as any}
            className="space-y-6 p-6 bg-gradient-to-br from-gray-50/50 to-white min-h-screen"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants as any}
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Welcome back, {session.data?.user?.name || 'Admin'}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your store today • {currentTime.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" onClick={loadDashboardData} disabled={isRefreshing}>
                            <RefreshCw className={`mr-2 h-4 w-4 ₹{isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Quick Action
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Stats Bar */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {quickStats.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants as any}>
                        <Card className="bg-gradient-to-r from-white to-gray-50/50 border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                        <p className="text-lg font-semibold">{stat.value}</p>
                                    </div>
                                    <div className={`flex items-center text-xs ₹{stat.positive ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {stat.positive ? (
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                        )}
                                        {stat.change}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Metrics Grid */}
            <motion.div
                variants={containerVariants}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                <MetricCard
                    title="Total Revenue"
                    value={loading ? "Loading..." : formatCurrency(dashboardData?.overview.monthlyRevenue || 0)}
                    icon={DollarSign}
                    growth={revenueGrowth}
                    description="Monthly revenue"
                    color="success"
                    trend={[45000, 52000, 48000, 61000, 55000, 67000, 72000]}
                />
                <MetricCard
                    title="Total Orders"
                    value={loading ? "Loading..." : formatNumber(dashboardData?.overview.totalOrders || 0)}
                    icon={ShoppingCart}
                    growth={ordersGrowth}
                    description="All time orders"
                    color="info"
                    trend={[120, 135, 148, 162, 158, 175, 189]}
                />
                <MetricCard
                    title="Total Customers"
                    value={loading ? "Loading..." : formatNumber(dashboardData?.overview.totalCustomers || 0)}
                    icon={Users}
                    growth={customersGrowth}
                    description="Registered customers"
                    color="default"
                    trend={[890, 920, 945, 978, 995, 1020, 1045]}
                />
                <MetricCard
                    title="Inventory Alerts"
                    value={loading ? "Loading..." : formatNumber((dashboardData?.inventory.lowStockCount || 0) + (dashboardData?.inventory.outOfStockCount || 0))}
                    icon={AlertTriangle}
                    description="Items need attention"
                    color={(dashboardData?.inventory.lowStockCount || 0) + (dashboardData?.inventory.outOfStockCount || 0) > 5 ? "warning" : "success"}
                />
            </motion.div>

            {/* Charts and Analytics Section */}
            <motion.div
                variants={containerVariants}
                className="grid gap-6 lg:grid-cols-3"
            >
                {/* Sales Trend Chart */}
                <motion.div
                    variants={itemVariants as any}
                    className="lg:col-span-2"
                >
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <LineChartIcon className="h-4 w-4 text-blue-600" />
                                        </div>
                                        Sales Performance
                                    </CardTitle>
                                    <CardDescription>Revenue and orders over the last 30 days</CardDescription>
                                </div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-80 w-full rounded-xl" />
                            ) : (
                                <motion.div
                                    variants={chartVariants as any}
                                    initial="hidden"
                                    animate="show"
                                >
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={salesAnalytics?.salesTrend || []}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="_id" stroke="#64748b" fontSize={12} />
                                            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#3b82f6"
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                                name="Revenue"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="orders"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                                name="Orders"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Order Status Breakdown */}
                <motion.div variants={itemVariants as any}>
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <PieChartIcon className="h-4 w-4 text-green-600" />
                                </div>
                                Order Status
                            </CardTitle>
                            <CardDescription>Current order distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-64 w-full rounded-xl" />
                            ) : (
                                <div className="space-y-4">
                                    <motion.div
                                        variants={chartVariants as any}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={salesAnalytics?.orderStats || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                >
                                                    {(salesAnalytics?.orderStats || []).map((entry, index) => (
                                                        <Cell key={`cell-₹{index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(salesAnalytics?.orderStats || []).map((status, index) => (
                                            <motion.div
                                                key={status._id}
                                                className="flex items-center gap-2"
                                                variants={listItemVariants}
                                                custom={index}
                                                initial="hidden"
                                                animate="show"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                />
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {status._id}: {status.count}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Recent Activity and Top Products */}
            <motion.div
                variants={containerVariants}
                className="grid gap-6 lg:grid-cols-2"
            >
                {/* Recent Orders */}
                <motion.div variants={itemVariants as any}>
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Activity className="h-4 w-4 text-purple-600" />
                                </div>
                                Recent Orders
                            </CardTitle>
                            <CardDescription>Latest customer orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            variants={listItemVariants}
                                            custom={i}
                                            initial="hidden"
                                            animate="show"
                                            className="flex items-center space-x-4"
                                        >
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <AnimatePresence>
                                    <div className="space-y-4">
                                        {dashboardData?.recentActivity.recentOrders.slice(0, 5).map((order, index) => (
                                            <motion.div
                                                key={order._id}
                                                variants={listItemVariants}
                                                custom={index}
                                                initial="hidden"
                                                animate="show"
                                                whileHover={{ scale: 1.01 }}
                                                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-purple-50/50 transition-colors"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=₹{order.user_id.name}`} />
                                                    <AvatarFallback className="bg-purple-100 text-purple-600">
                                                        {getInitials(order.user_id.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {order.user_id.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Order #{order._id.slice(-6)} • {formatRelativeTime(order.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                    <Badge variant={
                                                        order.status === 'completed' ? 'default' :
                                                            order.status === 'pending' ? 'secondary' :
                                                                order.status === 'cancelled' ? 'destructive' : 'outline'
                                                    } className="text-xs">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </AnimatePresence>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Products */}
                <motion.div variants={itemVariants as any}>
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Star className="h-4 w-4 text-orange-600" />
                                </div>
                                Top Products
                            </CardTitle>
                            <CardDescription>Best selling products this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            variants={listItemVariants}
                                            custom={i}
                                            initial="hidden"
                                            animate="show"
                                            className="flex items-center space-x-4"
                                        >
                                            <Skeleton className="h-12 w-12 rounded" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topSellingProducts.slice(0, 5).map((product, index) => (
                                        <motion.div
                                            key={product.productId}
                                            variants={listItemVariants}
                                            custom={index}
                                            initial="hidden"
                                            animate="show"
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-orange-50/50 transition-colors"
                                        >
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                    {product.productImage ? (
                                                        <img
                                                            src={product.productImage || "/placeholder.svg"}
                                                            alt={product.productName}
                                                            className="h-12 w-12 object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {product.productName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(product.price)} • {product.orderCount} orders
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {formatNumber(product.totalSold)} sold
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(product.totalRevenue)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Customer Analytics and Inventory Status */}
            <motion.div
                variants={containerVariants}
                className="grid gap-6 lg:grid-cols-3"
            >
                {/* Customer Growth */}
                <motion.div variants={itemVariants as any}>
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-cyan-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-cyan-100 rounded-lg">
                                    <Users className="h-4 w-4 text-cyan-600" />
                                </div>
                                Customer Growth
                            </CardTitle>
                            <CardDescription>New customers this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-48 w-full rounded-xl" />
                            ) : (
                                <motion.div
                                    variants={chartVariants as any}
                                    initial="hidden"
                                    animate="show"
                                >
                                    <ResponsiveContainer width="100%" height={180}>
                                        <AreaChart data={customerAnalytics?.customerGrowth || []}>
                                            <defs>
                                                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="_id" stroke="#64748b" fontSize={10} />
                                            <YAxis stroke="#64748b" fontSize={10} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="newCustomers"
                                                stroke="#06b6d4"
                                                fillOpacity={1}
                                                fill="url(#colorCustomers)"
                                                name="New Customers"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Inventory Status */}
                <motion.div variants={itemVariants as any}>
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-red-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Package className="h-4 w-4 text-red-600" />
                                </div>
                                Inventory Status
                            </CardTitle>
                            <CardDescription>Stock levels overview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>In Stock</span>
                                            <span className="font-medium">
                                                {(dashboardData?.inventory.totalProducts || 0) -
                                                    (dashboardData?.inventory.outOfStockCount || 0) -
                                                    (dashboardData?.inventory.lowStockCount || 0)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={85}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-orange-600">Low Stock</span>
                                            <span className="font-medium text-orange-600">
                                                {dashboardData?.inventory.lowStockCount || 0}
                                            </span>
                                        </div>
                                        <Progress
                                            value={12}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-red-600">Out of Stock</span>
                                            <span className="font-medium text-red-600">
                                                {dashboardData?.inventory.outOfStockCount || 0}
                                            </span>
                                        </div>
                                        <Progress
                                            value={3}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Total Products</span>
                                            <span>{dashboardData?.inventory.totalProducts || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={itemVariants as any}>
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Zap className="h-4 w-4 text-indigo-600" />
                                </div>
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Latest system events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence>
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            variants={listItemVariants}
                                            custom={index}
                                            initial="hidden"
                                            animate="show"
                                            whileHover={{ x: 5 }}
                                            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-indigo-50/50 transition-colors"
                                        >
                                            <div className={`p-1 rounded-full ₹{activity.status === 'success' ? 'bg-green-100' :
                                                activity.status === 'warning' ? 'bg-orange-100' :
                                                    activity.status === 'info' ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                {activity.status === 'success' ? (
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                ) : activity.status === 'warning' ? (
                                                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                                                ) : (
                                                    <Eye className="h-3 w-3 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants as any}>
                <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Target className="h-4 w-4 text-gray-600" />
                            </div>
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[
                                { icon: Plus, label: "Add Product", color: "bg-blue-100 text-blue-600" },
                                { icon: Users, label: "View Customers", color: "bg-green-100 text-green-600" },
                                { icon: ShoppingCart, label: "Orders", color: "bg-purple-100 text-purple-600" },
                                { icon: BarChart3, label: "Analytics", color: "bg-orange-100 text-orange-600" },
                                { icon: CreditCard, label: "Payments", color: "bg-cyan-100 text-cyan-600" },
                                { icon: Truck, label: "Shipping", color: "bg-red-100 text-red-600" },
                            ].map((action, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 w-full"
                                    >
                                        <div className={`p-3 rounded-lg ₹{action.color}`}>
                                            <action.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-medium">{action.label}</span>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Refresh Indicator */}
            <AnimatePresence>
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="bg-white p-6 rounded-full shadow-xl flex flex-col items-center"
                        >
                            <RefreshCw className="h-12 w-12 text-primary" />
                            <p className="mt-2 text-sm font-medium">Refreshing data...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}



