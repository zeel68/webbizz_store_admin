export const APP_CONFIG = {
    name: "WebBizz Store Admin",
    version: "2.0.0",
    description: "Advanced eCommerce Administration Dashboard",
    author: "WebBizz Team",
    supportEmail: "support@webbizz.com",
    features: {
        analytics: true,
        inventory: true,
        crm: true,
        marketing: true,
        automation: true,
        multiStore: true,
    },
}

export const DASHBOARD_ROUTES = {
    dashboard: "/",
    analytics: "/analytics",
    products: "/products",
    categories: "/categories",
    orders: "/orders",
    customers: "/customers",
    marketing: "/marketing",
    inventory: "/inventory",
    reviews: "/reviews",
    settings: "/settings",
    reports: "/reports",
    automation: "/automation",
} as const

export const ORDER_STATUSES = {
    pending: { label: "Pending", color: "yellow", icon: "Clock" },
    confirmed: { label: "Confirmed", color: "blue", icon: "CheckCircle" },
    processing: { label: "Processing", color: "purple", icon: "Package" },
    shipped: { label: "Shipped", color: "indigo", icon: "Truck" },
    delivered: { label: "Delivered", color: "green", icon: "CheckCircle2" },
    cancelled: { label: "Cancelled", color: "red", icon: "XCircle" },
    returned: { label: "Returned", color: "orange", icon: "RotateCcw" },
    refunded: { label: "Refunded", color: "pink", icon: "CreditCard" },
} as const

export const PAYMENT_STATUSES = {
    pending: { label: "Pending", color: "yellow" },
    paid: { label: "Paid", color: "green" },
    failed: { label: "Failed", color: "red" },
    refunded: { label: "Refunded", color: "blue" },
    partially_refunded: { label: "Partially Refunded", color: "orange" },
} as const

export const PRODUCT_STATUSES = {
    active: { label: "Active", color: "green" },
    inactive: { label: "Inactive", color: "red" },
    draft: { label: "Draft", color: "gray" },
    archived: { label: "Archived", color: "orange" },
} as const

export const CUSTOMER_SEGMENTS = {
    new: { label: "New Customers", color: "blue" },
    returning: { label: "Returning Customers", color: "green" },
    vip: { label: "VIP Customers", color: "purple" },
    at_risk: { label: "At Risk", color: "orange" },
    churned: { label: "Churned", color: "red" },
} as const

export const NOTIFICATION_TYPES = {
    order: { label: "New Order", icon: "ShoppingCart", color: "blue" },
    payment: { label: "Payment", icon: "CreditCard", color: "green" },
    inventory: { label: "Inventory Alert", icon: "Package", color: "orange" },
    customer: { label: "Customer", icon: "Users", color: "purple" },
    system: { label: "System", icon: "Settings", color: "gray" },
} as const

export const CHART_COLORS = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#ec4899", // pink
    "#6b7280", // gray
]

export const DATE_RANGES = {
    today: { label: "Today", days: 0 },
    yesterday: { label: "Yesterday", days: 1 },
    last_7_days: { label: "Last 7 days", days: 7 },
    last_30_days: { label: "Last 30 days", days: 30 },
    last_90_days: { label: "Last 90 days", days: 90 },
    last_year: { label: "Last year", days: 365 },
    custom: { label: "Custom range", days: null },
} as const

export const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    INR: "₹"
} as const

export const INVENTORY_ALERTS = {
    low_stock: { threshold: 10, severity: "warning" },
    out_of_stock: { threshold: 0, severity: "error" },
    overstock: { threshold: 1000, severity: "info" },
} as const

export const FILE_UPLOAD_LIMITS = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFiles: 10,
} as const

export const PAGINATION_LIMITS = {
    default: 25,
    options: [10, 25, 50, 100],
    max: 100,
} as const

export const SEARCH_DEBOUNCE_MS = 300
export const AUTO_SAVE_DEBOUNCE_MS = 1000
export const NOTIFICATION_DURATION = 5000
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
