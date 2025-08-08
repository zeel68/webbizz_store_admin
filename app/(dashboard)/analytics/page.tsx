"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAnalyticsStore } from "@/store/analyticsStore"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    ComposedChart,
} from "recharts"
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign, AlertTriangle, Eye, RefreshCw, Calendar, Download, ArrowUpRight, ArrowDownRight, Target, Clock, Globe, Smartphone, Monitor, Tablet, Star, Heart, ShoppingBag, CreditCard, Truck, CheckCircle, XCircle, AlertCircle, Info, BarChart3 } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"
import { toast } from "sonner"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300']

export default function AnalyticsPage() {
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
        clearError,
    } = useAnalyticsStore()

    const [selectedPeriod, setSelectedPeriod] = useState("30")
    const [activeTab, setActiveTab] = useState("overview")
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        loadAnalyticsData()
    }, [selectedPeriod])

    const loadAnalyticsData = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                fetchDashboardData(),
                fetchSalesAnalytics({ period: selectedPeriod }),
                fetchTopSellingProducts({ period: selectedPeriod, limit: 10 }),
                fetchCustomerAnalytics({ period: selectedPeriod }),
                fetchInventoryAnalytics(),
            ])
        } catch (error) {
            console.error("Failed to load analytics data:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleRefresh = () => {
        clearError()
        loadAnalyticsData()
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        toast.success("Export functionality coming soon!")
    }

    // Calculate growth percentages (mock data for now)
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
    const productsGrowth = getGrowthData(dashboardData?.overview.totalProducts || 0)

    // Enhanced metrics cards
    const MetricCard = ({
        title,
        value,
        icon: Icon,
        growth,
        description,
        color = "default"
    }: {
        title: string
        value: string | number
        icon: any
        growth?: { value: number; isPositive: boolean; formatted: string }
        description?: string
        color?: "default" | "success" | "warning" | "danger"
    }) => (
        <Card className={`hover:shadow-lg transition-all duration-200 ₹{color === "success" ? "border-green-200 bg-green-50/50" :
            color === "warning" ? "border-orange-200 bg-orange-50/50" :
                color === "danger" ? "border-red-200 bg-red-50/50" :
                    "hover:border-primary/20"
            }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ₹{color === "success" ? "text-green-600" :
                    color === "warning" ? "text-orange-600" :
                        color === "danger" ? "text-red-600" :
                            "text-muted-foreground"
                    }`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {growth && (
                    <div className="flex items-center space-x-1 mt-1">
                        {growth.isPositive ? (
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                        ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ₹{growth.isPositive ? "text-green-600" : "text-red-600"
                            }`}>
                            {growth.formatted}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    )

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{`₹{label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`₹{entry.name}: ₹{entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('price')
                                ? formatCurrency(entry.value)
                                : formatNumber(entry.value)
                                }`}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Error Loading Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">{error}</p>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Analytics</h1>
                    <p className="text-muted-foreground">
                        Comprehensive insights into your store performance and customer behavior
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-40">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ₹{isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Total Revenue"
                            value={formatCurrency(dashboardData?.overview.monthlyRevenue || 0)}
                            icon={DollarSign}
                            growth={revenueGrowth}
                            description="Monthly revenue"
                            color="success"
                        />
                        <MetricCard
                            title="Total Orders"
                            value={formatNumber(dashboardData?.overview.totalOrders || 0)}
                            icon={ShoppingCart}
                            growth={ordersGrowth}
                            description="All time orders"
                        />
                        <MetricCard
                            title="Total Customers"
                            value={formatNumber(dashboardData?.overview.totalCustomers || 0)}
                            icon={Users}
                            growth={customersGrowth}
                            description="Registered customers"
                        />
                        <MetricCard
                            title="Total Products"
                            value={formatNumber(dashboardData?.overview.totalProducts || 0)}
                            icon={Package}
                            growth={productsGrowth}
                            description="Active products"
                        />
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <MetricCard
                            title="Pending Orders"
                            value={formatNumber(dashboardData?.overview.pendingOrders || 0)}
                            icon={Clock}
                            description="Awaiting processing"
                            color={dashboardData?.overview.pendingOrders ?? 0 > 10 ? "warning" : "default"}
                        />
                        <MetricCard
                            title="Low Stock Items"
                            value={formatNumber(dashboardData?.inventory.lowStockCount || 0)}
                            icon={AlertTriangle}
                            description="Need restocking"
                            color={dashboardData?.inventory.lowStockCount ?? 0 > 5 ? "warning" : "default"}
                        />
                        <MetricCard
                            title="Out of Stock"
                            value={formatNumber(dashboardData?.inventory.outOfStockCount || 0)}
                            icon={XCircle}
                            description="Unavailable products"
                            color={dashboardData?.inventory.outOfStockCount ?? 0 > 0 ? "danger" : "success"}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Sales Trend Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Sales Trend
                                </CardTitle>
                                <CardDescription>Daily revenue over the selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-80 w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={salesAnalytics?.salesTrend || []}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#8884d8"
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Order Status Distribution
                                </CardTitle>
                                <CardDescription>Breakdown of orders by status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-80 w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={salesAnalytics?.orderStats || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `₹{name} ₹{(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                                nameKey="_id"
                                            >
                                                {(salesAnalytics?.orderStats || []).map((entry, index) => (
                                                    <Cell key={`cell-₹{index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Recent Orders
                                </CardTitle>
                                <CardDescription>Latest orders from your customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData?.recentActivity.recentOrders.slice(0, 5).map((order) => (
                                            <div key={order._id} className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <ShoppingCart className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {order.user_id.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.user_id.email}
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
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Top Rated Products
                                </CardTitle>
                                <CardDescription>Best performing products by rating</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-4">
                                                <Skeleton className="h-10 w-10 rounded" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData?.recentActivity.topProducts.slice(0, 5).map((product) => (
                                            <div key={product._id} className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0] || "/placeholder.svg"}
                                                            alt={product.name}
                                                            className="h-10 w-10 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {product.name}
                                                    </p>
                                                    <div className="flex items-center space-x-1">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-3 w-3 ₹{i < Math.floor(product.ratings.average)
                                                                        ? "text-yellow-400 fill-current"
                                                                        : "text-gray-300"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({product.ratings.count})
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Inventory Alerts */}
                    {dashboardData?.inventory && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <span>Inventory Status</span>
                                </CardTitle>
                                <CardDescription>Products requiring attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="flex items-center space-x-3 p-4 rounded-lg border">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <div>
                                            <p className="text-sm font-medium">Out of Stock</p>
                                            <p className="text-2xl font-bold text-red-600">
                                                {dashboardData.inventory.outOfStockCount}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 rounded-lg border">
                                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium">Low Stock</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {dashboardData.inventory.lowStockCount}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 rounded-lg border">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <div>
                                            <p className="text-sm font-medium">In Stock</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {dashboardData.inventory.totalProducts -
                                                    dashboardData.inventory.outOfStockCount -
                                                    dashboardData.inventory.lowStockCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-6">
                    {/* Sales Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard
                            title="Total Revenue"
                            value={formatCurrency(salesAnalytics?.summary.totalRevenue || 0)}
                            icon={DollarSign}
                            description="All time revenue"
                            color="success"
                        />
                        <MetricCard
                            title="Total Orders"
                            value={formatNumber(salesAnalytics?.summary.totalOrders || 0)}
                            icon={ShoppingCart}
                            description="All time orders"
                        />
                        <MetricCard
                            title="Average Order Value"
                            value={formatCurrency(salesAnalytics?.summary.averageOrderValue || 0)}
                            icon={Target}
                            description="Per order average"
                        />
                        <MetricCard
                            title="Conversion Rate"
                            value="2.4%"
                            icon={TrendingUp}
                            description="Visitors to customers"
                        />
                    </div>

                    {/* Sales Charts */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Revenue Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>Daily revenue over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-80 w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={salesAnalytics?.salesTrend || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
                                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} name="Revenue" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Revenue by payment method</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-80 w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salesAnalytics?.paymentStats || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-6">
                    {/* Customer Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard
                            title="Total Customers"
                            value={formatNumber(customerAnalytics?.stats.totalCustomers || 0)}
                            icon={Users}
                            description="All registered users"
                        />
                        <MetricCard
                            title="Active Customers"
                            value={formatNumber(customerAnalytics?.stats.activeCustomers || 0)}
                            icon={Eye}
                            description="Active in last 30 days"
                        />
                        <MetricCard
                            title="Repeat Customers"
                            value={formatNumber(customerAnalytics?.retention.repeatCustomers || 0)}
                            icon={Heart}
                            description="Made multiple purchases"
                        />
                        <MetricCard
                            title="Retention Rate"
                            value={formatPercentage(customerAnalytics?.retention.retentionRate || 0)}
                            icon={Target}
                            description="Customer retention"
                            color="success"
                        />
                    </div>

                    {/* Customer Charts */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer Growth */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Growth</CardTitle>
                                <CardDescription>New customer registrations over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-80 w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={customerAnalytics?.customerGrowth || []}>
                                            <defs>
                                                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="newCustomers"
                                                stroke="#82ca9d"
                                                fillOpacity={1}
                                                fill="url(#colorCustomers)"
                                                name="New Customers"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Customers */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Customers</CardTitle>
                                <CardDescription>Highest spending customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {customerAnalytics?.topCustomers?.slice(0, 5).map((customer, index) => (
                                            <div key={customer.customerId} className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <span className="text-sm font-bold">#{index + 1}</span>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {customer.customerName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {customer.customerEmail}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(customer.totalSpent)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {customer.orderCount} orders
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                            <CardDescription>Best performing products by sales volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <Skeleton className="h-12 w-12 rounded" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topSellingProducts.map((product, index) => (
                                        <div key={product.productId} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                                                <span className="text-sm font-bold text-primary">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                                {product.productImage ? (
                                                    <img
                                                        src={product.productImage || "/placeholder.svg"}
                                                        alt={product.productName}
                                                        className="h-12 w-12 rounded object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                )}
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
                                                    {formatCurrency(product.totalRevenue)} revenue
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    {/* Inventory Summary */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard
                            title="Total Products"
                            value={formatNumber(inventoryAnalytics?.summary.totalProducts || 0)}
                            icon={Package}
                            description="All products"
                        />
                        <MetricCard
                            title="Total Stock"
                            value={formatNumber(inventoryAnalytics?.summary.totalStock || 0)}
                            icon={BarChart3}
                            description="Units in inventory"
                        />
                        <MetricCard
                            title="Inventory Value"
                            value={formatCurrency(inventoryAnalytics?.summary.totalValue || 0)}
                            icon={DollarSign}
                            description="Total inventory worth"
                            color="success"
                        />
                        <MetricCard
                            title="Average Price"
                            value={formatCurrency(inventoryAnalytics?.summary.averagePrice || 0)}
                            icon={Target}
                            description="Per product average"
                        />
                    </div>

                    {/* Category Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Products by Category</CardTitle>
                            <CardDescription>Inventory distribution across categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-80 w-full" />
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={inventoryAnalytics?.categoryBreakdown || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="productCount" fill="#8884d8" name="Products" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Key Insights */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Key Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <TrendingUp className="h-4 w-4" />
                                    <AlertDescription>
                                        Revenue is up {revenueGrowth.formatted} compared to last period. Keep up the great work!
                                    </AlertDescription>
                                </Alert>

                                {dashboardData?.inventory.lowStockCount || 0 > 0 && (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            You have {dashboardData?.inventory.lowStockCount} products running low on stock. Consider restocking soon.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Alert>
                                    <Users className="h-4 w-4" />
                                    <AlertDescription>
                                        Customer retention rate is {formatPercentage(customerAnalytics?.retention.retentionRate || 0)}.
                                        Focus on customer satisfaction to improve retention.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Optimize Top Products</p>
                                            <p className="text-xs text-muted-foreground">
                                                Focus marketing efforts on your best-selling products to maximize revenue.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Inventory Management</p>
                                            <p className="text-xs text-muted-foreground">
                                                Set up automated reorder points to prevent stockouts.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Customer Engagement</p>
                                            <p className="text-xs text-muted-foreground">
                                                Implement loyalty programs to increase customer retention.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
