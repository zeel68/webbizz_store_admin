// Advanced Analytics interfaces
interface iCustomerSegment {
    _id: string
    count: number
    totalRevenue: number
    avgOrderValue: number
    avgOrderCount: number
}

interface iCustomerLifetimeValue {
    avgLifetimeValue: number
    avgOrderFrequency: number
    avgCustomerLifespan: number
    totalCustomers: number
}

interface iCustomerRetention {
    _id: string
    uniqueUsers: number
}

interface iCustomerGeography {
    _id: {
        country: string
        city: string
    }
    sessions: number
    uniqueUserCount: number
    totalRevenue: number
    conversions: number
    conversionRate: number
}

interface iDeviceAnalytics {
    _id: string
    sessions: number
    uniqueUserCount: number
    avgSessionDuration: number
    conversions: number
    revenue: number
    conversionRate: number
}

interface iCustomerJourney {
    _id: string
    sessions: number
    conversions: number
    revenue: number
    avgSessionDuration: number
    conversionRate: number
    revenuePerSession: number
}

interface iCustomerActivity {
    _id: {
        hour: number
        dayOfWeek: number
    }
    sessions: number
    conversions: number
    conversionRate: number
}

interface iCustomerBehaviorAnalytics {
    customerSegmentation: iCustomerSegment[]
    customerLifetimeValue: iCustomerLifetimeValue
    customerRetention: iCustomerRetention[]
    customerGeography: iCustomerGeography[]
    customerDevices: iDeviceAnalytics[]
    customerJourney: iCustomerJourney[]
    topCustomers: Array<{
        name: string
        email: string
        totalSpent: number
        orderCount: number
        lastOrderDate: string
        avgOrderValue: number
    }>
    customerActivity: iCustomerActivity[]
}

interface iProductView {
    productName: string
    productImage: string
    price: number
    totalViews: number
    uniqueViewerCount: number
    avgViewDuration: number
    avgScrollDepth: number
}

interface iProductCartAdd {
    productName: string
    productImage: string
    price: number
    totalAdds: number
    uniqueUserCount: number
    totalQuantity: number
    conversionRate: number
}

interface iProductWishlist {
    productName: string
    productImage: string
    price: number
    totalWishlists: number
    uniqueUserCount: number
    cartConversionRate: number
    orderConversionRate: number
}

interface iConversionFunnel {
    name: string
    price: number
    images: string[]
    viewCount: number
    cartAddCount: number
    orderCount: number
    viewToCartRate: number
    cartToOrderRate: number
}

interface iProductEngagement {
    productName: string
    avgEngagementTime: number
    avgScrollDepth: number
    totalViews: number
    bounceRate: number
}

interface iAbandonedCartProduct {
    productName: string
    productImage: string
    abandonedCount: number
    totalValue: number
    avgQuantity: number
}

interface iProductRevenueAnalysis {
    productName: string
    productImage: string
    totalRevenue: number
    totalQuantitySold: number
    orderCount: number
    avgPrice: number
    revenuePerUnit: number
}

interface iProductPerformanceAnalytics {
    mostViewedProducts: iProductView[]
    mostAddedToCart: iProductCartAdd[]
    mostWishlisted: iProductWishlist[]
    conversionFunnel: iConversionFunnel[]
    productEngagement: iProductEngagement[]
    abandonedCartProducts: iAbandonedCartProduct[]
    productRevenueAnalysis: iProductRevenueAnalysis[]
}

interface iGeographicAnalytics {
    countryAnalytics: Array<{
        _id: {
            country: string
            countryCode: string
        }
        sessions: number
        uniqueUserCount: number
        totalRevenue: number
        conversions: number
        avgSessionDuration: number
        bounceRate: number
        conversionRate: number
        revenuePerSession: number
    }>
    cityAnalytics: Array<{
        _id: {
            city: string
            country: string
        }
        sessions: number
        uniqueUserCount: number
        totalRevenue: number
        conversions: number
        conversionRate: number
    }>
    trafficSources: Array<{
        _id: {
            country: string
            source: string
        }
        sessions: number
        conversions: number
        revenue: number
        conversionRate: number
    }>
    deviceByLocation: Array<{
        _id: {
            country: string
            deviceType: string
        }
        sessions: number
        conversions: number
        conversionRate: number
    }>
    conversionByLocation: Array<{
        _id: string
        totalConversions: number
        totalRevenue: number
        avgOrderValue: number
    }>
}

interface iRealTimeAnalytics {
    activeUsers: number
    recentActivity: Array<{
        user_id: {
            name: string
            email: string
        }
        location: {
            country: string
            city: string
        }
        device_info: {
            device_type: string
        }
        referrer: {
            source: string
        }
        created_at: string
        converted: boolean
        conversion_value: number
    }>
    liveConversions: Array<{
        order_number: string
        total_amount: number
        user_id: {
            name: string
            email: string
        }
        created_at: string
        items: any[]
    }>
    topPages: Array<{
        productName: string
        views: number
        uniqueViewerCount: number
    }>
    realtimeMetrics: Array<{
        _id: {
            hour: number
        }
        sessions: number
        conversions: number
        revenue: number
    }>
}

interface iConversionFunnelAnalytics {
    overallFunnel: {
        totalSessions: Array<{ count: number }>
        productViews: Array<{ count: number }>
        cartAdds: Array<{ count: number }>
        conversions: Array<{ count: number }>
    }
    funnelBySource: Array<{
        _id: string
        totalSessions: number
        conversions: number
        revenue: number
        conversionRate: number
        revenuePerSession: number
    }>
    funnelByDevice: Array<{
        _id: string
        totalSessions: number
        conversions: number
        avgSessionDuration: number
        bounceRate: number
        conversionRate: number
    }>
    abandonmentAnalysis: Array<{
        _id: {
            hour: number
            dayOfWeek: number
        }
        totalCartAdds: number
        conversions: number
        abandonmentRate: number
    }>
}


// Analytics interfaces
interface iDashboardOverview {
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    monthlyRevenue: number
    pendingOrders: number
}

interface iInventoryStats {
    lowStockCount: number
    outOfStockCount: number
    totalProducts: number
}

interface iRecentOrder {
    _id: string
    total_amount: number
    status: string
    created_at: string
    user_id: {
        name: string
        email: string
    }
}

interface iTopProduct {
    _id: string
    name: string
    price: number
    ratings: {
        average: number
        count: number
    }
    images: string[]
}

interface iDashboardData {
    overview: iDashboardOverview
    inventory: iInventoryStats
    recentActivity: {
        recentOrders: iRecentOrder[]
        topProducts: iTopProduct[]
    }
}

interface iSalesTrend {
    _id: string
    revenue: number
    orders: number
}

interface iSalesAnalytics {
    salesTrend: iSalesTrend[]
    summary: {
        totalRevenue: number
        totalOrders: number
        averageOrderValue: number
    }
    orderStats: Array<{
        _id: string
        count: number
        revenue: number
    }>
    paymentStats: Array<{
        _id: string
        count: number
        revenue: number
    }>
}

interface iTopSellingProduct {
    productId: string
    productName: string
    productImage: string
    price: number
    totalSold: number
    totalRevenue: number
    orderCount: number
}

interface iCustomerGrowth {
    _id: string
    newCustomers: number
}

interface iTopCustomer {
    customerId: string
    customerName: string
    customerEmail: string
    totalSpent: number
    orderCount: number
    lastOrderDate: string
    averageOrderValue: number
}

interface iCustomerAnalytics {
    customerGrowth: iCustomerGrowth[]
    topCustomers: iTopCustomer[]
    stats: {
        totalCustomers: number
        activeCustomers: number
    }
    retention: {
        totalCustomers: number
        repeatCustomers: number
        retentionRate: number
    }
}

interface iInventoryAnalytics {
    summary: {
        totalProducts: number
        totalStock: number
        totalValue: number
        lowStock: number
        outOfStock: number
        averagePrice: number
        averageRating: number
    }
    categoryBreakdown: Array<{
        _id: string
        productCount: number
        totalStock: number
        averagePrice: number
        totalValue: number
    }>
    recentUpdates: Array<{
        _id: string
        name: string
        stock: { quantity: number }
        price: number
        updated_at: string
        parent_category: { name: string }
    }>
    topSellingByCategory: Array<{
        categoryName: string
        topProducts: Array<{
            name: string
            rating: number
            reviewCount: number
            stock: number
        }>
    }>
}

