"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/ui/analytics-chart"

import {
    Users,
    ShoppingCart,
    Package,
    DollarSign,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    RefreshCw,
    Plus,
    Target,
    Globe,
    CreditCard,
    Truck,
    BarChart3,
    Download,
} from "lucide-react"
import { formatCurrency, formatNumber, formatRelativeTime, getInitials } from "@/lib/utils"

import { DATE_RANGES } from "@/lib/constants"
import { DataTable } from "@/components/ui/data-table"
import { useAnalytics } from "@/lib/hooks/use-analytics"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"


// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
        },
    },
}

const fadeIn = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [dateRange, setDateRange] = useState("last_30_days")
    const [isRefreshing, setIsRefreshing] = useState(false)

    const {
        data: analyticsData,
        loading,
        error,
        refetch,
        exportData,
    } = useAnalytics({
        dateRange,
    })

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: "r",
            ctrlKey: true,
            action: () => {
                setIsRefreshing(true)
                refetch().finally(() => setIsRefreshing(false))
            },
            description: "Refresh dashboard data",
        },
        {
            key: "e",
            ctrlKey: true,
            action: () => exportData("csv"),
            description: "Export analytics data",
        },
        {
            key: "n",
            ctrlKey: true,
            action: () => window.open("/products/add", "_blank"),
            description: "Create new product",
        },
    ])

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refetch()
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleExport = async (format: "csv" | "xlsx" | "pdf" = "csv") => {
        try {
            await exportData(format)
        } catch (error) {
            console.error("Export failed:", error)
        }
    }

    // Mock data for recent orders table
    const recentOrdersColumns = [
        {
            key: "order_number" as const,
            label: "Order",
            sortable: true,
            render: (value: string) => <div className="font-mono text-sm">#{value}</div>,
        },
        {
            key: "customer" as const,
            label: "Customer",
            sortable: true,
            render: (value: any) => (
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">{getInitials(value.name)}</span>
                    </div>
                    <div>
                        <div className="font-medium text-sm">{value.name}</div>
                        <div className="text-xs text-muted-foreground">{value.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "status" as const,
            label: "Status",
            sortable: true,
            render: (value: string) => <Badge variant={value === "completed" ? "default" : "secondary"}>{value}</Badge>,
        },
        {
            key: "total" as const,
            label: "Total",
            sortable: true,
            align: "right" as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            key: "created_at" as const,
            label: "Date",
            sortable: true,
            render: (value: string) => formatRelativeTime(value),
        },
    ]

    const mockRecentOrders = [
        {
            id: "1",
            order_number: "12345",
            customer: { name: "John Doe", email: "john@example.com" },
            status: "completed",
            total: 299.99,
            created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
            id: "2",
            order_number: "12346",
            customer: { name: "Jane Smith", email: "jane@example.com" },
            status: "processing",
            total: 149.99,
            created_at: new Date(Date.now() - 600000).toISOString(),
        },
        {
            id: "3",
            order_number: "12347",
            customer: { name: "Bob Johnson", email: "bob@example.com" },
            status: "shipped",
            total: 89.99,
            created_at: new Date(Date.now() - 900000).toISOString(),
        },
    ]

    // Enhanced Metric Card Component
    const MetricCard = ({
        title,
        value,
        icon: Icon,
        growth,
        description,
        color = "default",
        trend = [],
        onClick,
    }: {
        title: string
        value: string | number
        icon: any
        growth?: { value: number; isPositive: boolean; formatted: string }
        description?: string
        color?: "default" | "success" | "warning" | "danger" | "info"
        trend?: number[]
        onClick?: () => void
    }) => (
        <motion.div variants={itemVariants} className="relative">
            <Card
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${color === "success"
                    ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100/50"
                    : color === "warning"
                        ? "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50"
                        : color === "danger"
                            ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50"
                            : color === "info"
                                ? "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50"
                                : "bg-gradient-to-br from-white to-gray-50/50 hover:border-primary/20"
                    }`}
                onClick={onClick}
            >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <Icon className="w-full h-full" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div
                        className={`p-2 rounded-lg ${color === "success"
                            ? "bg-green-100 text-green-600"
                            : color === "warning"
                                ? "bg-orange-100 text-orange-600"
                                : color === "danger"
                                    ? "bg-red-100 text-red-600"
                                    : color === "info"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-primary/10 text-primary"
                            }`}
                    >
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
                            <span className={`text-xs font-medium ${growth.isPositive ? "text-green-600" : "text-red-600"}`}>
                                {growth.formatted}
                            </span>
                            <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                    )}
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </CardContent>
            </Card>
        </motion.div>
    )

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={handleRefresh} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
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
                        Welcome back, {session?.user?.name || "Admin"}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your store today •{" "}
                        {currentTime.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        {Object.entries(DATE_RANGES).map(([key, range]) => (
                            <option key={key} value={key}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => handleExport("csv")}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Main Metrics Grid */}
            <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={loading ? "Loading..." : formatCurrency(analyticsData?.revenue.total || 0)}
                    icon={DollarSign}
                    growth={
                        analyticsData?.revenue.growth
                            ? {
                                value: analyticsData.revenue.growth,
                                isPositive: analyticsData.revenue.growth >= 0,
                                formatted: `${analyticsData.revenue.growth >= 0 ? "+" : ""}${analyticsData.revenue.growth.toFixed(1)}%`,
                            }
                            : undefined
                    }
                    description="Monthly revenue"
                    color="success"
                    onClick={() => window.open("/analytics", "_blank")}
                />
                <MetricCard
                    title="Total Orders"
                    value={loading ? "Loading..." : formatNumber(analyticsData?.orders.total || 0)}
                    icon={ShoppingCart}
                    growth={
                        analyticsData?.orders.growth
                            ? {
                                value: analyticsData.orders.growth,
                                isPositive: analyticsData.orders.growth >= 0,
                                formatted: `${analyticsData.orders.growth >= 0 ? "+" : ""}${analyticsData.orders.growth.toFixed(1)}%`,
                            }
                            : undefined
                    }
                    description="All time orders"
                    color="info"
                    onClick={() => window.open("/orders", "_blank")}
                />
                <MetricCard
                    title="Total Customers"
                    value={loading ? "Loading..." : formatNumber(analyticsData?.customers.total || 0)}
                    icon={Users}
                    growth={
                        analyticsData?.customers.total && analyticsData?.customers.new
                            ? {
                                value: (analyticsData.customers.new / analyticsData.customers.total) * 100,
                                isPositive: true,
                                formatted: `${analyticsData.customers.new} new`,
                            }
                            : undefined
                    }
                    description="Registered customers"
                    color="default"
                    onClick={() => window.open("/customers", "_blank")}
                />
                <MetricCard
                    title="Low Stock Items"
                    value={loading ? "Loading..." : formatNumber(analyticsData?.products.lowStock || 0)}
                    icon={AlertTriangle}
                    description="Items need attention"
                    color={
                        (analyticsData?.products.lowStock || 0) > 10
                            ? "danger"
                            : (analyticsData?.products.lowStock || 0) > 5
                                ? "warning"
                                : "success"
                    }
                    onClick={() => window.open("/inventory", "_blank")}
                />
            </motion.div>

            {/* Charts and Analytics Section */}
            <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
                {/* Revenue Trend Chart */}
                <motion.div variants={itemVariants as any} className="lg:col-span-2">
                    <AnalyticsChart
                        title="Revenue Trend"
                        description="Revenue and orders over time"
                        data={analyticsData?.revenue.trend || []}
                        type="area"
                        dataKeys={["value"]}
                        xAxisKey="date"
                        height={300}
                        showTrend={true}
                        trendValue={analyticsData?.revenue.growth}
                        formatValue={(value) => formatCurrency(value)}
                        onExport={() => handleExport("csv")}
                        onExpand={() => window.open("/analytics", "_blank")}
                    />
                </motion.div>

                {/* Conversion Funnel */}
                <motion.div variants={itemVariants as any}>
                    <AnalyticsChart
                        title="Conversion Funnel"
                        description="Customer journey stages"
                        data={analyticsData?.conversion.funnel || []}
                        type="bar"
                        dataKeys={["count"]}
                        xAxisKey="stage"
                        height={300}
                        showLegend={false}
                        formatValue={(value) => formatNumber(value)}
                    />
                </motion.div>
            </motion.div>

            {/* Detailed Analytics Tabs */}
            <motion.div variants={itemVariants as any}>
                <Tabs defaultValue="orders" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                        <TabsTrigger value="products">Top Products</TabsTrigger>
                        <TabsTrigger value="customers">Customer Insights</TabsTrigger>
                        <TabsTrigger value="geographic">Geographic Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Latest customer orders and their status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    data={mockRecentOrders}
                                    columns={recentOrdersColumns}
                                    loading={loading}
                                    searchable={true}
                                    searchPlaceholder="Search orders..."
                                    selectable={true}
                                    pagination={true}
                                    pageSize={10}
                                    onRowClick={(order: any) => window.open(`/orders/${order.id}`, "_blank")}
                                    bulkActions={[
                                        {
                                            label: "Export Selected",
                                            icon: <Download className="mr-2 h-4 w-4" />,
                                            action: (selectedRows: any) => console.log("Export", selectedRows),
                                        },
                                        {
                                            label: "Mark as Processed",
                                            icon: <CheckCircle className="mr-2 h-4 w-4" />,
                                            action: (selectedRows: any) => console.log("Process", selectedRows),
                                        },
                                    ]}
                                    emptyState={{
                                        icon: <ShoppingCart className="h-8 w-8 text-muted-foreground" />,
                                        title: "No orders found",
                                        description: "Orders will appear here once customers start purchasing",
                                        action: {
                                            label: "View All Orders",
                                            onClick: () => window.open("/orders", "_blank"),
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Selling Products</CardTitle>
                                    <CardDescription>Best performing products by revenue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div key={i} className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-muted rounded" />
                                                    <div className="space-y-1 flex-1">
                                                        <div className="h-4 bg-muted rounded w-3/4" />
                                                        <div className="h-3 bg-muted rounded w-1/2" />
                                                    </div>
                                                    <div className="h-4 bg-muted rounded w-16" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {analyticsData?.products.topSelling?.slice(0, 5).map((product, index) => (
                                                <div key={product.id} className="flex items-center space-x-3">
                                                    <div className="relative">
                                                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{product.name}</p>
                                                        <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Performance</CardTitle>
                                    <CardDescription>Sales distribution by category</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnalyticsChart
                                        title=""
                                        data={[
                                            { name: "Electronics", value: 45 },
                                            { name: "Clothing", value: 30 },
                                            { name: "Books", value: 15 },
                                            { name: "Home", value: 10 },
                                        ]}
                                        type="pie"
                                        dataKeys={["value"]}
                                        xAxisKey="name"
                                        height={200}
                                        showLegend={true}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="customers" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Growth</CardTitle>
                                    <CardDescription>New vs returning customers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnalyticsChart
                                        title=""
                                        data={[
                                            { date: "Jan", new: 120, returning: 80 },
                                            { date: "Feb", new: 150, returning: 95 },
                                            { date: "Mar", new: 180, returning: 110 },
                                            { date: "Apr", new: 200, returning: 130 },
                                            { date: "May", new: 220, returning: 150 },
                                        ]}
                                        type="bar"
                                        dataKeys={["new", "returning"]}
                                        xAxisKey="date"
                                        height={250}
                                        showLegend={true}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Segments</CardTitle>
                                    <CardDescription>Customer distribution by value</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { label: "VIP Customers", count: 45, percentage: 15, color: "bg-purple-500" },
                                            { label: "Regular Customers", count: 180, percentage: 60, color: "bg-blue-500" },
                                            { label: "New Customers", count: 75, percentage: 25, color: "bg-green-500" },
                                        ].map((segment) => (
                                            <div key={segment.label} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{segment.label}</span>
                                                    <span className="font-medium">{segment.count}</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className={`${segment.color} h-2 rounded-full transition-all duration-300`}
                                                        style={{ width: `${segment.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="geographic" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Geographic Distribution</CardTitle>
                                <CardDescription>Sales by country and region</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Top Countries</h4>
                                        {analyticsData?.geographic?.slice(0, 5).map((country, index) => (
                                            <div key={country.country} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-4 bg-muted rounded-sm flex items-center justify-center">
                                                        <Globe className="h-3 w-3" />
                                                    </div>
                                                    <span className="text-sm">{country.country}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">{formatCurrency(country.revenue)}</div>
                                                    <div className="text-xs text-muted-foreground">{country.orders} orders</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <AnalyticsChart
                                        title=""
                                        data={analyticsData?.geographic || []}
                                        type="bar"
                                        dataKeys={["revenue"]}
                                        xAxisKey="country"
                                        height={250}
                                        formatValue={(value) => formatCurrency(value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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
                                { icon: Plus, label: "Add Product", color: "bg-blue-100 text-blue-600", href: "/products/add" },
                                { icon: Users, label: "View Customers", color: "bg-green-100 text-green-600", href: "/customers" },
                                { icon: ShoppingCart, label: "Orders", color: "bg-purple-100 text-purple-600", href: "/orders" },
                                { icon: BarChart3, label: "Analytics", color: "bg-orange-100 text-orange-600", href: "/analytics" },
                                { icon: CreditCard, label: "Payments", color: "bg-cyan-100 text-cyan-600", href: "/payments" },
                                { icon: Truck, label: "Shipping", color: "bg-red-100 text-red-600", href: "/shipping" },
                            ].map((action, index) => (
                                <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 w-full"
                                        onClick={() => window.open(action.href, "_blank")}
                                    >
                                        <div className={`p-3 rounded-lg ${action.color}`}>
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
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
