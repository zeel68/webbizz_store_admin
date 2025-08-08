// import { create } from "zustand";
// import { devtools, persist } from "zustand/middleware";
// import ApiClient from "@/lib/apiCalling";
// import { getSession } from "next-auth/react";

// // Import all schema types
// import type { Product, ProductFormData } from "@/models/schemas/product";
// import type {
//   StoreCategory,
//   StoreCategoryFormData,
// } from "@/models/schemas/storeCategory";
// import type { Order, OrderFormData } from "@/models/schemas/order";
// import type { User, UserFormData } from "@/models/schemas/user";
// import type { Coupon, CouponFormData } from "@/models/schemas/coupon";
// import type {
//   ShippingMethod,
//   ShippingMethodFormData,
// } from "@/models/schemas/shipping";
// import type { Category } from "@/models/schemas/store";
// import { log } from "console";

// interface Review {
//   _id: string;
//   user: string;
//   rating: number;
//   comment: string;
//   date: string;
//   status?: string;
//   product_name?: string;
//   customer_name?: string;
//   customer_avatar?: string;
//   reply?: string;
// }

// interface Pagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
//   pages?: number;
//   hasNext?: boolean;
//   hasPrev?: boolean;
// }

// interface ProductsInfo {
//   products: Product[];
//   pagination: Pagination;
// }

// interface OrderInfo {
//   orders: Order[];
//   pagination: Pagination;
// }

// interface CustomersInfo {
//   customers: User[];
//   pagination: Pagination;
// }

// interface CouponsInfo {
//   coupons: Coupon[];
//   pagination: Pagination;
// }

// interface ReviewsInfo {
//   reviews: Review[];
//   pagination: Pagination;
// }

// interface InventoryItem {
//   _id: string;
//   name: string;
//   price: number;
//   current_stock: number;
//   reserved_stock: number;
//   available_stock: number;
//   total_value: number | null;
//   status: "in-stock" | "low-stock" | "out-of-stock";
//   images?: string;
//   low_stock_threshold?: number;
// }

// interface InventoryInfo {
//   inventory: InventoryItem[];
//   pagination: Pagination;
// }

// interface StoreStats {
//   totalRevenue: number;
//   monthlyRevenue: number;
//   totalProducts: number;
//   activeProducts: number;
//   totalOrders: number;
//   pendingOrders: number;
//   lowStockProducts: number;
//   totalCustomers?: number;
// }

// interface StoreConfig {
//   name?: string;
//   description?: string;
//   contact_email?: string;
//   contact_phone?: string;
//   business_hours?: any;
//   hero_section?: Array<{
//     title: string;
//     subtitle: string;
//     image: string;
//     cta_text: string;
//     cta_link: string;
//   }>;
//   featured_products?: Array<{
//     product_id: string;
//     sort_order: number;
//   }>;
// }

// interface TopSellingProduct {
//   _id: string;
//   totalSold: number;
//   totalRevenue: number;
//   orderCount: number;
//   productId: string;
//   productName: string;
//   productImage: string;
//   price: number;
// }

// interface CustomerAnalytics {
//   customerGrowth: any[];
//   topCustomers: Array<{
//     _id: string;
//     totalSpent: number;
//     orderCount: number;
//     lastOrderDate: string;
//     customerId: string;
//     customerName: string;
//     customerEmail: string;
//     averageOrderValue: number;
//   }>;
//   stats: {
//     totalCustomers: number;
//     activeCustomers: number;
//   };
//   retention: {
//     _id: string | null;
//     totalCustomers: number;
//     repeatCustomers: number;
//     retentionRate: number;
//   };
// }

// interface CouponAnalytics {
//   totalCoupons: number;
//   activeCoupons: number;
//   totalUsage: number;
//   totalSavings: number;
//   topCoupons: Array<{
//     _id: string;
//     code: string;
//     usage_count: number;
//     total_savings: number;
//     conversion_rate: number;
//   }>;
//   usageByType: Array<{
//     type: string;
//     count: number;
//     total_savings: number;
//   }>;
//   monthlyUsage: Array<{
//     month: string;
//     usage_count: number;
//     savings: number;
//   }>;
// }

// interface ReviewAnalytics {
//   totalReviews: number;
//   averageRating: number;
//   ratingDistribution: Array<{
//     rating: number;
//     count: number;
//     percentage: number;
//   }>;
//   monthlyReviews: Array<{
//     month: string;
//     count: number;
//     average_rating: number;
//   }>;
//   topReviewedProducts: Array<{
//     product_id: string;
//     product_name: string;
//     review_count: number;
//     average_rating: number;
//   }>;
//   sentimentAnalysis: {
//     positive: number;
//     neutral: number;
//     negative: number;
//   };
// }

// interface InventoryAnalytics {
//   summary: {
//     _id: string | null;
//     totalProducts: number;
//     totalStock: number;
//     totalValue: number;
//     lowStock: number;
//     outOfStock: number;
//     averagePrice: number;
//     averageRating: number;
//   };
//   categoryBreakdown: Array<{
//     _id: string;
//     productCount: number;
//     totalStock: number;
//     averagePrice: number;
//     totalValue: number;
//   }>;
//   recentUpdates: Array<{
//     stock: { quantity: number };
//     _id: string;
//     name: string;
//     price: number;
//     parent_category: {
//       _id: string;
//       name: string;
//       id: string;
//     };
//   }>;
//   topSellingByCategory: Array<{
//     _id: string;
//     categoryName: string;
//     topProducts: Array<{
//       name: string;
//       rating: number;
//       reviewCount: number;
//       stock: number;
//     }>;
//   }>;
// }

// interface Analytics {
//   totalCustomers?: number;
//   newCustomersThisMonth?: number;
//   repeatCustomerRate?: number;
//   averageOrderValue?: number;
//   conversionRate?: number;
//   salesData?: any[];
//   topProducts?: Product[];
//   topSellingProducts?: TopSellingProduct[];
//   customerAnalytics?: CustomerAnalytics;
//   couponAnalytics?: CouponAnalytics;
//   reviewAnalytics?: ReviewAnalytics;
//   inventoryAnalytics?: InventoryAnalytics;
// }

// interface CacheEntry<T> {
//   data: T;
//   timestamp: number;
//   hash?: string;
// }

// interface QueryCache {
//   [key: string]: CacheEntry<any>;
// }

// interface StoreAdminState {
//   // Products
//   productsInfo: ProductsInfo | null;
//   productsLoading: boolean;
//   productsCache: QueryCache;

//   // Categories (Store Categories)
//   categories: StoreCategory[];
//   categoriesLoading: boolean;
//   categoriesCache: CacheEntry<StoreCategory[]> | null;

//   // Parent Categories
//   parentCategories: Category[];
//   parentCategoriesLoading: boolean;
//   parentCategoriesCache: CacheEntry<Category[]> | null;

//   // Orders
//   ordersInfo: OrderInfo | null;
//   ordersLoading: boolean;
//   ordersCache: QueryCache;

//   // Customers
//   customersInfo: CustomersInfo | null;
//   customersLoading: boolean;
//   customersCache: QueryCache;

//   // Coupons
//   couponsInfo: CouponsInfo | null;
//   couponsLoading: boolean;
//   couponsCache: QueryCache;

//   // Reviews
//   reviewsInfo: ReviewsInfo | null;
//   reviewsLoading: boolean;
//   reviewsCache: QueryCache;

//   // Inventory
//   inventoryInfo: InventoryInfo | null;
//   inventoryLoading: boolean;
//   inventoryCache: CacheEntry<InventoryInfo> | null;

//   // Store Stats
//   storeStats: StoreStats | null;
//   statsLoading: boolean;
//   statsCache: CacheEntry<StoreStats> | null;

//   // Store Config
//   storeConfig: StoreConfig | null;
//   configLoading: boolean;

//   // Analytics
//   analytics: Analytics | null;
//   analyticsLoading: boolean;
//   analyticsCache: QueryCache;

//   // Shipping Methods
//   shippingMethods: ShippingMethod[];
//   shippingMethodsLoading: boolean;
//   shippingMethodsCache: CacheEntry<ShippingMethod[]> | null;

//   // General
//   isLoading: boolean;
//   loading: boolean;
//   error: string | null;

//   // Data change tracking with timestamps
//   dataVersion: {
//     products: number;
//     categories: number;
//     orders: number;
//     customers: number;
//     coupons: number;
//     reviews: number;
//     inventory: number;
//     stats: number;
//     shippingMethods: number;
//   };

//   // Helper functions
//   getApiClient: () => Promise<ApiClient>;
//   getCacheKey: (query: any) => string;
//   isCacheValid: <T>(cache: CacheEntry<T> | null, maxAge?: number) => boolean;
//   invalidateCache: (type: keyof StoreAdminState["dataVersion"]) => void;
//   clearAllCaches: () => void;

//   // Fetch Actions with smart caching
//   fetchProducts: (query: any, force?: boolean) => Promise<void>;
//   fetchCategories: (force?: boolean) => Promise<void>;
//   fetchParentCategories: (force?: boolean) => Promise<void>;
//   fetchOrders: (query: any, force?: boolean) => Promise<void>;
//   fetchCustomers: (query: any, force?: boolean) => Promise<void>;
//   fetchCoupons: (query: any, force?: boolean) => Promise<void>;
//   fetchReviews: (query: any, force?: boolean) => Promise<void>;
//   fetchInventory: (query?: any, force?: boolean) => Promise<void>;
//   fetchStoreStats: (force?: boolean) => Promise<void>;
//   fetchStoreConfig: () => Promise<void>;
//   fetchAnalytics: (force?: boolean) => Promise<void>;
//   fetchShippingMethods: (force?: boolean) => Promise<void>;
//   fetchTopSellingProducts: () => Promise<void>;
//   fetchCustomerAnalytics: () => Promise<void>;
//   fetchCouponAnalytics: () => Promise<void>;
//   fetchReviewAnalytics: () => Promise<void>;
//   fetchInventoryAnalytics: () => Promise<void>;

//   // Product CRUD Actions
//   createProduct: (productData: ProductFormData) => Promise<Product>;
//   updateProduct: (
//     id: string,
//     productData: Partial<ProductFormData>,
//   ) => Promise<Product>;
//   deleteProduct: (id: string) => Promise<void>;
//   bulkUpdateProducts: (
//     productIds: string[],
//     updates: Partial<ProductFormData>,
//   ) => Promise<void>;
//   duplicateProduct: (id: string) => Promise<Product>;

//   // Category CRUD Actions
//   createCategory: (
//     categoryData: StoreCategoryFormData,
//   ) => Promise<StoreCategory>;
//   updateCategory: (
//     id: string,
//     categoryData: Partial<StoreCategoryFormData>,
//   ) => Promise<StoreCategory>;
//   deleteCategory: (id: string) => Promise<void>;

//   // Order CRUD Actions
//   createOrder: (orderData: OrderFormData) => Promise<Order>;
//   updateOrder: (
//     id: string,
//     orderData: Partial<OrderFormData>,
//   ) => Promise<Order>;
//   updateOrderStatus: (
//     orderId: string,
//     status: Order["status"],
//     trackingNumber?: string,
//   ) => Promise<void>;
//   deleteOrder: (id: string) => Promise<void>;

//   // Customer CRUD Actions
//   createCustomer: (customerData: UserFormData) => Promise<User>;
//   updateCustomer: (
//     id: string,
//     customerData: Partial<UserFormData>,
//   ) => Promise<User>;
//   deleteCustomer: (id: string) => Promise<void>;

//   // Coupon CRUD Actions
//   createCoupon: (couponData: CouponFormData) => Promise<Coupon>;
//   updateCoupon: (
//     id: string,
//     couponData: Partial<CouponFormData>,
//   ) => Promise<Coupon>;
//   deleteCoupon: (id: string) => Promise<void>;
//   duplicateCoupon: (id: string, newCode: string) => Promise<Coupon>;

//   // Review Actions
//   updateReviewStatus: (
//     id: string,
//     status: string,
//     adminNotes?: string,
//   ) => Promise<void>;
//   replyToReview: (id: string, reply: string) => Promise<void>;
//   deleteReview: (id: string) => Promise<void>;

//   // Inventory Actions
//   updateStock: (
//     productId: string,
//     quantity: number,
//     operation: string,
//     reason?: string,
//   ) => Promise<void>;
//   bulkUpdateStock: (updates: any[], reason?: string) => Promise<void>;

//   // Shipping Methods Actions
//   createShippingMethod: (
//     methodData: ShippingMethodFormData,
//   ) => Promise<ShippingMethod>;
//   updateShippingMethod: (
//     id: string,
//     methodData: Partial<ShippingMethodFormData>,
//   ) => Promise<ShippingMethod>;
//   deleteShippingMethod: (id: string) => Promise<void>;

//   // Store Config Actions
//   updateStoreConfig: (configData: any) => Promise<void>;
//   updateHomepageConfig: (configData: any) => Promise<void>;

//   // Utility Actions
//   clearError: () => void;
//   resetStore: () => void;
// }

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// const STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for stats
// const CATEGORIES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for categories

// export const useStoreAdminStore = create<StoreAdminState>()(
//   devtools(
//     persist(
//       (set, get) => {
//         const getApiClient = async (): Promise<ApiClient> => {
//           try {
//             const session = await getSession();
//             return new ApiClient({
//               headers: {
//                 Authorization: `Bearer ₹{session?.accessToken}`,
//               },
//             });
//           } catch (error) {
//             console.error("Failed to get session:", error);
//             return new ApiClient({});
//           }
//         };

//         const getCacheKey = (query: any): string => {
//           const sortedQuery = Object.keys(query || {})
//             .sort()
//             .reduce((result, key) => {
//               result[key] = query[key];
//               return result;
//             }, {} as any);
//           return JSON.stringify(sortedQuery);
//         };

//         const isCacheValid = <T>(
//           cache: CacheEntry<T> | null,
//           maxAge: number = CACHE_DURATION,
//         ): boolean => {
//           if (!cache) return false;
//           return Date.now() - cache.timestamp < maxAge;
//         };

//         const invalidateCache = (
//           type: keyof StoreAdminState["dataVersion"],
//         ) => {
//           set((state) => ({
//             dataVersion: {
//               ...state.dataVersion,
//               [type]: Date.now(),
//             },
//           }));
//         };

//         const clearAllCaches = () => {
//           set({
//             productsCache: {},
//             categoriesCache: null,
//             parentCategoriesCache: null,
//             ordersCache: {},
//             customersCache: {},
//             couponsCache: {},
//             reviewsCache: {},
//             inventoryCache: null,
//             statsCache: null,
//             analyticsCache: {},
//             shippingMethodsCache: null,
//           });
//         };

//         return {
//           // Initial state
//           productsInfo: null,
//           productsLoading: false,
//           productsCache: {},
//           categories: [],
//           categoriesLoading: false,
//           categoriesCache: null,
//           parentCategories: [],
//           parentCategoriesLoading: false,
//           parentCategoriesCache: null,
//           ordersInfo: null,
//           ordersLoading: false,
//           ordersCache: {},
//           customersInfo: null,
//           customersLoading: false,
//           customersCache: {},
//           couponsInfo: null,
//           couponsLoading: false,
//           couponsCache: {},
//           reviewsInfo: null,
//           reviewsLoading: false,
//           reviewsCache: {},
//           inventoryInfo: null,
//           inventoryLoading: false,
//           inventoryCache: null,
//           storeStats: null,
//           statsLoading: false,
//           statsCache: null,
//           storeConfig: null,
//           configLoading: false,
//           analytics: null,
//           analyticsLoading: false,
//           analyticsCache: {},
//           shippingMethods: [],
//           shippingMethodsLoading: false,
//           shippingMethodsCache: null,
//           isLoading: false,
//           loading: false,
//           error: null,
//           dataVersion: {
//             products: 0,
//             categories: 0,
//             orders: 0,
//             customers: 0,
//             coupons: 0,
//             reviews: 0,
//             inventory: 0,
//             stats: 0,
//             shippingMethods: 0,
//           },

//           // Helper functions
//           getApiClient,
//           getCacheKey,
//           isCacheValid,
//           invalidateCache,
//           clearAllCaches,

//           // Fetch Products with enhanced caching
//           fetchProducts: async (query: any, force: boolean = false) => {
//             const state = get();
//             const cacheKey = getCacheKey(query);
//             const cachedData = state.productsCache[cacheKey];

//             if (!force && isCacheValid(cachedData)) {
//               set({ productsInfo: cachedData.data, productsLoading: false });
//               return;
//             }

//             set({ productsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const searchParams = new URLSearchParams();

//               Object.entries(query || {}).forEach(([key, value]) => {
//                 if (value && value !== "all") {
//                   searchParams.append(key, value.toString());
//                 }
//               });

//               const response = await apiClient.get(
//                 `/store-admin/products?₹{searchParams.toString()}`,
//               ) as ApiResponse<any>;
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 const newCache = { ...state.productsCache };
//                 newCache[cacheKey] = { data, timestamp: Date.now() };

//                 set({
//                   productsInfo: data,
//                   productsLoading: false,
//                   productsCache: newCache,
//                 });
//               } else {
//                 set({
//                   error: response.error || "Failed to fetch products",
//                   productsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch products",
//                 productsLoading: false,
//               });
//             }
//           },

//           // Fetch Categories (Store Categories) with enhanced caching
//           fetchCategories: async (force: boolean = false) => {
//             const state = get();

//             if (
//               !force &&
//               isCacheValid(state.categoriesCache, CATEGORIES_CACHE_DURATION) &&
//               state.categories.length > 0
//             ) {
//               return;
//             }

//             set({ categoriesLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/getStoreCategories",
//               ) as ApiResponse<any>;
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 set({
//                   categories: data,
//                   categoriesLoading: false,
//                   categoriesCache: { data, timestamp: Date.now() },
//                 });
//               } else {
//                 set({
//                   error:
//                     response.error || "Failed to fetch categories",
//                   categoriesLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch categories",
//                 categoriesLoading: false,
//               });
//             }
//           },

//           // Fetch Parent Categories with caching
//           fetchParentCategories: async (force: boolean = false) => {
//             const state = get();

//             if (
//               !force &&
//               isCacheValid(
//                 state.parentCategoriesCache,
//                 CATEGORIES_CACHE_DURATION,
//               ) &&
//               state.parentCategories.length > 0
//             ) {
//               return;
//             }

//             set({ parentCategoriesLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get("/store-admin/category") as ApiResponse<any>;
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 set({
//                   parentCategories: Array.isArray(data) ? data : [data],
//                   parentCategoriesLoading: false,
//                   parentCategoriesCache: {
//                     data: Array.isArray(data) ? data : [data],
//                     timestamp: Date.now(),
//                   },
//                 });
//               } else {
//                 set({
//                   error:
//                     response.error ||
//                     "Failed to fetch parent categories",
//                   parentCategoriesLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch parent categories",
//                 parentCategoriesLoading: false,
//               });
//             }
//           },

//           // Fetch Orders with enhanced caching
//           fetchOrders: async (query: any, force: boolean = false) => {
//             const state = get();
//             const cacheKey = getCacheKey(query);
//             const cachedData = state.ordersCache[cacheKey];

//             if (!force && isCacheValid(cachedData)) {
//               set({ ordersInfo: cachedData.data, ordersLoading: false });
//               return;
//             }

//             set({ ordersLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const searchParams = new URLSearchParams();

//               Object.entries(query || {}).forEach(([key, value]) => {
//                 if (value && value !== "all") {
//                   searchParams.append(key, value.toString());
//                 }
//               });

//               const response = await apiClient.get(
//                 `/store-admin/orders?₹{searchParams.toString()}`,
//               );
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 const newCache = { ...state.ordersCache };
//                 newCache[cacheKey] = { data, timestamp: Date.now() };

//                 set({
//                   ordersInfo: data,
//                   ordersLoading: false,
//                   ordersCache: newCache,
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch orders",
//                   ordersLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch orders",
//                 ordersLoading: false,
//               });
//             }
//           },

//           // Fetch Customers with enhanced caching
//           fetchCustomers: async (query: any, force: boolean = false) => {
//             const state = get();
//             const cacheKey = getCacheKey(query);
//             const cachedData = state.customersCache[cacheKey];

//             if (!force && isCacheValid(cachedData)) {
//               set({ customersInfo: cachedData.data, customersLoading: false });
//               return;
//             }

//             set({ customersLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const searchParams = new URLSearchParams();

//               Object.entries(query || {}).forEach(([key, value]) => {
//                 if (value && value !== "all") {
//                   searchParams.append(key, value.toString());
//                 }
//               });

//               const response = await apiClient.get(
//                 `/store-admin/customers?₹{searchParams.toString()}`,
//               );
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 const newCache = { ...state.customersCache };
//                 newCache[cacheKey] = { data, timestamp: Date.now() };

//                 set({
//                   customersInfo: data,
//                   customersLoading: false,
//                   customersCache: newCache,
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch customers",
//                   customersLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch customers",
//                 customersLoading: false,
//               });
//             }
//           },

//           // Fetch Coupons with enhanced caching
//           fetchCoupons: async (query: any, force: boolean = false) => {
//             const state = get();
//             const cacheKey = getCacheKey(query);
//             const cachedData = state.couponsCache[cacheKey];

//             if (!force && isCacheValid(cachedData)) {
//               set({ couponsInfo: cachedData.data, couponsLoading: false });
//               return;
//             }

//             set({ couponsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const searchParams = new URLSearchParams();

//               Object.entries(query || {}).forEach(([key, value]) => {
//                 if (value && value !== "all") {
//                   searchParams.append(key, value.toString());
//                 }
//               });

//               const response = await apiClient.get(
//                 `/store-admin/coupons?₹{searchParams.toString()}`,
//               );
//               if (response.success) {
//                 const data = response.data.data;
//                 const newCache = { ...state.couponsCache };
//                 newCache[cacheKey] = { data, timestamp: Date.now() };

//                 set({
//                   couponsInfo: data,
//                   couponsLoading: false,
//                   couponsCache: newCache,
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch coupons",
//                   couponsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch coupons",
//                 couponsLoading: false,
//               });
//             }
//           },

//           // Fetch Reviews with enhanced caching
//           fetchReviews: async (query: any, force: boolean = false) => {
//             const state = get();
//             const cacheKey = getCacheKey(query);
//             const cachedData = state.reviewsCache[cacheKey];

//             if (!force && isCacheValid(cachedData)) {
//               set({ reviewsInfo: cachedData.data, reviewsLoading: false });
//               return;
//             }

//             set({ reviewsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const searchParams = new URLSearchParams();

//               Object.entries(query || {}).forEach(([key, value]) => {
//                 if (value && value !== "all") {
//                   searchParams.append(key, value.toString());
//                 }
//               });

//               const response = await apiClient.get(
//                 `/store-admin/reviews?₹{searchParams.toString()}`,
//               );
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 const newCache = { ...state.reviewsCache };
//                 newCache[cacheKey] = { data, timestamp: Date.now() };

//                 set({
//                   reviewsInfo: data,
//                   reviewsLoading: false,
//                   reviewsCache: newCache,
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch reviews",
//                   reviewsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch reviews",
//                 reviewsLoading: false,
//               });
//             }
//           },

//           // Fetch Inventory with enhanced caching
//           fetchInventory: async (query: any = {}, force: boolean = false) => {
//             const state = get();

//             if (!force && isCacheValid(state.inventoryCache)) {
//               return;
//             }

//             set({ inventoryLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const searchParams = new URLSearchParams();

//               Object.entries(query).forEach(([key, value]) => {
//                 if (value && value !== "all") {
//                   searchParams.append(key, value.toString());
//                 }
//               });

//               const response = await apiClient.get(
//                 `/store-admin/inventory?₹{searchParams.toString()}`,
//               );
//               if (response.success) {
//                 const data = response.data.data;
//                 set({
//                   inventoryInfo: data,
//                   inventoryLoading: false,
//                   inventoryCache: { data, timestamp: Date.now() },
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch inventory",
//                   inventoryLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch inventory",
//                 inventoryLoading: false,
//               });
//             }
//           },

//           // Fetch Store Stats with enhanced caching
//           fetchStoreStats: async (force: boolean = false) => {
//             const state = get();

//             if (
//               !force &&
//               isCacheValid(state.statsCache, STATS_CACHE_DURATION)
//             ) {
//               return;
//             }

//             set({ statsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get("/store-admin/dashboard");
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 set({
//                   storeStats: data,
//                   statsLoading: false,
//                   statsCache: { data, timestamp: Date.now() },
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch stats",
//                   statsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch stats",
//                 statsLoading: false,
//               });
//             }
//           },

//           // Fetch Store Config
//           fetchStoreConfig: async () => {
//             set({ configLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/homepage/config",
//               );
//               if (response.success) {
//                 set({
//                   storeConfig: response.data.data || response.data,
//                   configLoading: false,
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch config",
//                   configLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch config",
//                 configLoading: false,
//               });
//             }
//           },

//           // Fetch Analytics with enhanced caching
//           fetchAnalytics: async (force: boolean = false) => {
//             const state = get();
//             const cacheKey = "analytics";
//             const cachedData = state.analyticsCache[cacheKey];

//             if (!force && isCacheValid(cachedData)) {
//               set({ analytics: cachedData.data, analyticsLoading: false });
//               return;
//             }

//             set({ analyticsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/analytics/sales?period=30d",
//               );
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 const newCache = { ...state.analyticsCache };
//                 newCache[cacheKey] = { data, timestamp: Date.now() };

//                 set({
//                   analytics: data,
//                   analyticsLoading: false,
//                   analyticsCache: newCache,
//                 });
//               } else {
//                 set({
//                   error: response.error?.message || "Failed to fetch analytics",
//                   analyticsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch analytics",
//                 analyticsLoading: false,
//               });
//             }
//           },

//           // Fetch Shipping Methods with caching
//           fetchShippingMethods: async (force: boolean = false) => {
//             const state = get();

//             if (
//               !force &&
//               isCacheValid(state.shippingMethodsCache) &&
//               state.shippingMethods.length > 0
//             ) {
//               return;
//             }

//             set({ shippingMethodsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/shipping-methods",
//               );
//               if (response.success) {
//                 const data = response.data.data || response.data;
//                 set({
//                   shippingMethods: data,
//                   shippingMethodsLoading: false,
//                   shippingMethodsCache: { data, timestamp: Date.now() },
//                 });
//               } else {
//                 set({
//                   error:
//                     response.error?.message ||
//                     "Failed to fetch shipping methods",
//                   shippingMethodsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch shipping methods",
//                 shippingMethodsLoading: false,
//               });
//             }
//           },

//           // Fetch Top Selling Products
//           fetchTopSellingProducts: async () => {
//             set({ analyticsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/analytics/products/top-selling?limit=10",
//               );
//               if (response.success) {
//                 set((state) => ({
//                   analytics: {
//                     ...state.analytics,
//                     topSellingProducts: response.data.data || response.data,
//                   },
//                   analyticsLoading: false,
//                 }));
//               } else {
//                 set({
//                   error:
//                     response.error?.message ||
//                     "Failed to fetch top selling products",
//                   analyticsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch top selling products",
//                 analyticsLoading: false,
//               });
//             }
//           },

//           // Fetch Customer Analytics
//           fetchCustomerAnalytics: async () => {
//             set({ analyticsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/analytics/customers",
//               );
//               if (response.success) {
//                 set((state) => ({
//                   analytics: {
//                     ...state.analytics,
//                     customerAnalytics: response.data,
//                   },
//                   analyticsLoading: false,
//                 }));
//               } else {
//                 set({
//                   error:
//                     response.error?.message ||
//                     "Failed to fetch customer analytics",
//                   analyticsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch customer analytics",
//                 analyticsLoading: false,
//               });
//             }
//           },

//           // Fetch Coupon Analytics
//           fetchCouponAnalytics: async () => {
//             set({ analyticsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/analytics/coupons",
//               );
//               if (response.success) {
//                 set((state) => ({
//                   analytics: {
//                     ...state.analytics,
//                     couponAnalytics: response.data,
//                   },
//                   analyticsLoading: false,
//                 }));
//               } else {
//                 set({
//                   error:
//                     response.error?.message ||
//                     "Failed to fetch coupon analytics",
//                   analyticsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch coupon analytics",
//                 analyticsLoading: false,
//               });
//             }
//           },

//           // Fetch Review Analytics
//           fetchReviewAnalytics: async () => {
//             set({ analyticsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/analytics/reviews",
//               );
//               if (response.success) {
//                 set((state) => ({
//                   analytics: {
//                     ...state.analytics,
//                     reviewAnalytics: response.data,
//                   },
//                   analyticsLoading: false,
//                 }));
//               } else {
//                 set({
//                   error:
//                     response.error?.message ||
//                     "Failed to fetch review analytics",
//                   analyticsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch review analytics",
//                 analyticsLoading: false,
//               });
//             }
//           },

//           // Fetch Inventory Analytics
//           fetchInventoryAnalytics: async () => {
//             set({ analyticsLoading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.get(
//                 "/store-admin/analytics/inventory",
//               );
//               if (response.success) {
//                 set((state) => ({
//                   analytics: {
//                     ...state.analytics,
//                     inventoryAnalytics: response.data,
//                   },
//                   analyticsLoading: false,
//                 }));
//               } else {
//                 set({
//                   error:
//                     response.error?.message ||
//                     "Failed to fetch inventory analytics",
//                   analyticsLoading: false,
//                 });
//               }
//             } catch (error: any) {
//               set({
//                 error: error.message || "Failed to fetch inventory analytics",
//                 analyticsLoading: false,
//               });
//             }
//           },

//           // Create Product
//           createProduct: async (productData: ProductFormData) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               console.log(productData);
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 "/store-admin/products",
//                 productData,
//               );
//               console.log(response);
//               if (response.success) {
//                 // Invalidate products cache
//                 invalidateCache("products");
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   productsCache: {}, // Clear cache to force refresh
//                 });
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to create product";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to create product";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Product
//           updateProduct: async (
//             id: string,
//             productData: Partial<ProductFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             console.log(productData);
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/products/₹{id}`,
//                 productData,
//               );
//               if (response.success) {
//                 // Update local state and invalidate cache
//                 set((state) => {
//                   const currentProducts = state.productsInfo?.products || [];
//                   const updatedProducts = currentProducts.map((product) =>
//                     product._id === id
//                       ? { ...product, ...response.data }
//                       : product,
//                   );
//                   return {
//                     productsInfo: state.productsInfo
//                       ? {
//                         ...state.productsInfo,
//                         products: updatedProducts,
//                       }
//                       : null,
//                     isLoading: false,
//                     loading: false,
//                     error: null,
//                     productsCache: {}, // Clear cache
//                   };
//                 });
//                 invalidateCache("products");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update product";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.response?.data?.message ||
//                 error.message ||
//                 "Failed to update product";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Product
//           deleteProduct: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/products/₹{id}`,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   productsInfo: state.productsInfo
//                     ? {
//                       ...state.productsInfo,
//                       products: state.productsInfo.products.filter(
//                         (p) => p._id !== id,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   productsCache: {}, // Clear cache
//                 }));
//                 invalidateCache("products");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete product";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to delete product";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Bulk Update Products
//           bulkUpdateProducts: async (
//             productIds: string[],
//             updates: Partial<ProductFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.patch(
//                 "/store-admin/products/bulk-update",
//                 {
//                   product_ids: productIds,
//                   updates,
//                 },
//               );
//               if (response.success) {
//                 // Clear cache and invalidate
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   productsCache: {},
//                 });
//                 invalidateCache("products");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to bulk update products";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to bulk update products";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Duplicate Product
//           duplicateProduct: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 `/store-admin/products/₹{id}/duplicate`,
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   productsCache: {}, // Clear cache
//                 });
//                 invalidateCache("products");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to duplicate product";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to duplicate product";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Create Category
//           createCategory: async (categoryData: StoreCategoryFormData) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 "/store-admin/category",
//                 categoryData,
//               );
//               if (response.success) {
//                 const state = get();
//                 set({
//                   categories: [response.data, ...state.categories],
//                   isLoading: false,
//                   loading: false,
//                   categoriesCache: null, // Clear cache
//                 });
//                 invalidateCache("categories");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to create category";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to create category";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Category
//           updateCategory: async (
//             id: string,
//             categoryData: Partial<StoreCategoryFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/category/₹{id}`,
//                 categoryData,
//               );
//               if (response.success) {
//                 const state = get();
//                 set({
//                   categories: state.categories.map((c) =>
//                     c._id === id ? { ...c, ...response.data } : c,
//                   ),
//                   isLoading: false,
//                   loading: false,
//                   categoriesCache: null, // Clear cache
//                 });
//                 invalidateCache("categories");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update category";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update category";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Category
//           deleteCategory: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/category/₹{id}`,
//               );
//               if (response.success) {
//                 const state = get();
//                 set({
//                   categories: state.categories.filter((c) => c._id !== id),
//                   isLoading: false,
//                   loading: false,
//                   categoriesCache: null, // Clear cache
//                 });
//                 invalidateCache("categories");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete category";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to delete category";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Create Order
//           createOrder: async (orderData: OrderFormData) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 "/store-admin/orders",
//                 orderData,
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   ordersCache: {}, // Clear cache
//                 });
//                 invalidateCache("orders");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to create order";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to create order";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Order
//           updateOrder: async (
//             id: string,
//             orderData: Partial<OrderFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/orders/₹{id}`,
//                 orderData,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   ordersInfo: state.ordersInfo
//                     ? {
//                       ...state.ordersInfo,
//                       orders: state.ordersInfo.orders.map((o) =>
//                         o._id === id ? { ...o, ...response.data } : o,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   ordersCache: {}, // Clear cache
//                 }));
//                 invalidateCache("orders");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update order";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update order";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Order Status
//           updateOrderStatus: async (
//             orderId: string,
//             status: Order["status"],
//             trackingNumber?: string,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/orders/₹{orderId}/status`,
//                 {
//                   status,
//                   tracking_number: trackingNumber,
//                 },
//               );
//               if (response.success) {
//                 set((state) => ({
//                   ordersInfo: state.ordersInfo
//                     ? {
//                       ...state.ordersInfo,
//                       orders: state.ordersInfo.orders.map((o) =>
//                         o._id === orderId
//                           ? { ...o, status, tracking_number: trackingNumber }
//                           : o,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   ordersCache: {}, // Clear cache
//                 }));
//                 invalidateCache("orders");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update order";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update order";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Order
//           deleteOrder: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/orders/₹{id}`,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   ordersInfo: state.ordersInfo
//                     ? {
//                       ...state.ordersInfo,
//                       orders: state.ordersInfo.orders.filter(
//                         (o) => o._id !== id,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   ordersCache: {}, // Clear cache
//                 }));
//                 invalidateCache("orders");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete order";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to delete order";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Create Customer
//           createCustomer: async (customerData: UserFormData) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 "/store-admin/customers",
//                 customerData,
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   customersCache: {}, // Clear cache
//                 });
//                 invalidateCache("customers");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to create customer";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to create customer";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Customer
//           updateCustomer: async (
//             id: string,
//             customerData: Partial<UserFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/customers/₹{id}`,
//                 customerData,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   customersInfo: state.customersInfo
//                     ? {
//                       ...state.customersInfo,
//                       customers: state.customersInfo.customers.map((c) =>
//                         c._id === id ? { ...c, ...response.data } : c,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   customersCache: {}, // Clear cache
//                 }));
//                 invalidateCache("customers");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update customer";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update customer";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Customer
//           deleteCustomer: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/customers/₹{id}`,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   customersInfo: state.customersInfo
//                     ? {
//                       ...state.customersInfo,
//                       customers: state.customersInfo.customers.filter(
//                         (c) => c._id !== id,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   customersCache: {}, // Clear cache
//                 }));
//                 invalidateCache("customers");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete customer";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to delete customer";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Create Coupon
//           createCoupon: async (couponData: CouponFormData) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 "/store-admin/coupons",
//                 couponData,
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   couponsCache: {}, // Clear cache
//                 });
//                 invalidateCache("coupons");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to create coupon";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to create coupon";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Coupon
//           updateCoupon: async (
//             id: string,
//             couponData: Partial<CouponFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/coupons/₹{id}`,
//                 couponData,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   couponsInfo: state.couponsInfo
//                     ? {
//                       ...state.couponsInfo,
//                       coupons: state.couponsInfo.coupons.map((c) =>
//                         c._id === id ? { ...c, ...response.data } : c,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   couponsCache: {}, // Clear cache
//                 }));
//                 invalidateCache("coupons");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update coupon";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update coupon";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Coupon
//           deleteCoupon: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/coupons/₹{id}`,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   couponsInfo: state.couponsInfo
//                     ? {
//                       ...state.couponsInfo,
//                       coupons: state.couponsInfo.coupons.filter(
//                         (c) => c._id !== id,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   couponsCache: {}, // Clear cache
//                 }));
//                 invalidateCache("coupons");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete coupon";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to delete coupon";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Duplicate Coupon
//           duplicateCoupon: async (id: string, newCode: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 `/store-admin/coupons/₹{id}/duplicate`,
//                 { new_code: newCode },
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   couponsCache: {}, // Clear cache
//                 });
//                 invalidateCache("coupons");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to duplicate coupon";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to duplicate coupon";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Review Status
//           updateReviewStatus: async (
//             id: string,
//             status: string,
//             adminNotes?: string,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/reviews/₹{id}/status`,
//                 {
//                   status,
//                   admin_notes: adminNotes,
//                 },
//               );
//               if (response.success) {
//                 set((state) => ({
//                   reviewsInfo: state.reviewsInfo
//                     ? {
//                       ...state.reviewsInfo,
//                       reviews: state.reviewsInfo.reviews.map((r) =>
//                         r._id === id ? { ...r, status } : r,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   reviewsCache: {}, // Clear cache
//                 }));
//                 invalidateCache("reviews");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update review";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update review";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Reply to Review
//           replyToReview: async (id: string, reply: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 `/store-admin/reviews/₹{id}/reply`,
//                 { reply },
//               );
//               if (response.success) {
//                 set((state) => ({
//                   reviewsInfo: state.reviewsInfo
//                     ? {
//                       ...state.reviewsInfo,
//                       reviews: state.reviewsInfo.reviews.map((r) =>
//                         r._id === id ? { ...r, reply } : r,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   reviewsCache: {}, // Clear cache
//                 }));
//                 invalidateCache("reviews");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to reply to review";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to reply to review";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Review
//           deleteReview: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/reviews/₹{id}`,
//               );
//               if (response.success) {
//                 set((state) => ({
//                   reviewsInfo: state.reviewsInfo
//                     ? {
//                       ...state.reviewsInfo,
//                       reviews: state.reviewsInfo.reviews.filter(
//                         (r) => r._id !== id,
//                       ),
//                     }
//                     : null,
//                   isLoading: false,
//                   loading: false,
//                   reviewsCache: {}, // Clear cache
//                 }));
//                 invalidateCache("reviews");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete review";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to delete review";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Stock
//           updateStock: async (
//             productId: string,
//             quantity: number,
//             operation: string,
//             reason?: string,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/inventory/₹{productId}/stock`,
//                 {
//                   quantity,
//                   operation,
//                   reason,
//                 },
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   inventoryCache: null, // Clear cache
//                   productsCache: {}, // Clear products cache too
//                 });
//                 invalidateCache("inventory");
//                 invalidateCache("products");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update stock";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update stock";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Bulk Update Stock
//           bulkUpdateStock: async (updates: any[], reason?: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 "/store-admin/inventory/bulk-update",
//                 {
//                   updates,
//                   reason,
//                 },
//               );
//               if (response.success) {
//                 set({
//                   isLoading: false,
//                   loading: false,
//                   inventoryCache: null, // Clear cache
//                   productsCache: {}, // Clear products cache too
//                 });
//                 invalidateCache("inventory");
//                 invalidateCache("products");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to bulk update stock";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to bulk update stock";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Create Shipping Method
//           createShippingMethod: async (methodData: ShippingMethodFormData) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.post(
//                 "/store-admin/shipping-methods",
//                 methodData,
//               );
//               if (response.success) {
//                 const state = get();
//                 set({
//                   shippingMethods: [response.data, ...state.shippingMethods],
//                   isLoading: false,
//                   loading: false,
//                   shippingMethodsCache: null, // Clear cache
//                 });
//                 invalidateCache("shippingMethods");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to create shipping method";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to create shipping method";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Shipping Method
//           updateShippingMethod: async (
//             id: string,
//             methodData: Partial<ShippingMethodFormData>,
//           ) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 `/store-admin/shipping-methods/₹{id}`,
//                 methodData,
//               );
//               if (response.success) {
//                 const state = get();
//                 set({
//                   shippingMethods: state.shippingMethods.map((m) =>
//                     m._id === id ? { ...m, ...response.data } : m,
//                   ),
//                   isLoading: false,
//                   loading: false,
//                   shippingMethodsCache: null, // Clear cache
//                 });
//                 invalidateCache("shippingMethods");
//                 return response.data;
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update shipping method";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to update shipping method";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Delete Shipping Method
//           deleteShippingMethod: async (id: string) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.delete(
//                 `/store-admin/shipping-methods/₹{id}`,
//               );
//               if (response.success) {
//                 const state = get();
//                 set({
//                   shippingMethods: state.shippingMethods.filter(
//                     (m) => m._id !== id,
//                   ),
//                   isLoading: false,
//                   loading: false,
//                   shippingMethodsCache: null, // Clear cache
//                 });
//                 invalidateCache("shippingMethods");
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to delete shipping method";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to delete shipping method";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Store Config
//           updateStoreConfig: async (configData: any) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 "/store-admin/store/config",
//                 configData,
//               );
//               if (response.success) {
//                 set({
//                   storeConfig: { ...get().storeConfig, ...response.data },
//                   isLoading: false,
//                   loading: false,
//                 });
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update config";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage = error.message || "Failed to update config";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Update Homepage Config
//           updateHomepageConfig: async (configData: any) => {
//             set({ isLoading: true, loading: true, error: null });
//             try {
//               const apiClient = await getApiClient();
//               const response = await apiClient.put(
//                 "/store-admin/homepage",
//                 configData,
//               );
//               if (response.success) {
//                 set({
//                   storeConfig: { ...get().storeConfig, ...response.data },
//                   isLoading: false,
//                   loading: false,
//                 });
//               } else {
//                 const errorMsg =
//                   response.error?.message || "Failed to update homepage config";
//                 set({ error: errorMsg, isLoading: false, loading: false });
//                 throw new Error(errorMsg);
//               }
//             } catch (error: any) {
//               const errorMessage =
//                 error.message || "Failed to update homepage config";
//               set({ error: errorMessage, isLoading: false, loading: false });
//               throw new Error(errorMessage);
//             }
//           },

//           // Clear Error
//           clearError: () => set({ error: null }),

//           // Reset Store
//           resetStore: () => {
//             set({
//               productsInfo: null,
//               productsLoading: false,
//               productsCache: {},
//               categories: [],
//               categoriesLoading: false,
//               categoriesCache: null,
//               parentCategories: [],
//               parentCategoriesLoading: false,
//               parentCategoriesCache: null,
//               ordersInfo: null,
//               ordersLoading: false,
//               ordersCache: {},
//               customersInfo: null,
//               customersLoading: false,
//               customersCache: {},
//               couponsInfo: null,
//               couponsLoading: false,
//               couponsCache: {},
//               reviewsInfo: null,
//               reviewsLoading: false,
//               reviewsCache: {},
//               inventoryInfo: null,
//               inventoryLoading: false,
//               inventoryCache: null,
//               storeStats: null,
//               statsLoading: false,
//               statsCache: null,
//               storeConfig: null,
//               configLoading: false,
//               analytics: null,
//               analyticsLoading: false,
//               analyticsCache: {},
//               shippingMethods: [],
//               shippingMethodsLoading: false,
//               shippingMethodsCache: null,
//               isLoading: false,
//               loading: false,
//               error: null,
//               dataVersion: {
//                 products: 0,
//                 categories: 0,
//                 orders: 0,
//                 customers: 0,
//                 coupons: 0,
//                 reviews: 0,
//                 inventory: 0,
//                 stats: 0,
//                 shippingMethods: 0,
//               },
//             });
//           },
//         };
//       },
//       {
//         name: "store-admin-store",
//         partialize: (state) => ({
//           dataVersion: state.dataVersion,
//           storeStats: state.storeStats,
//           categories: state.categories,
//           parentCategories: state.parentCategories,
//           shippingMethods: state.shippingMethods,
//           statsCache: state.statsCache,
//           categoriesCache: state.categoriesCache,
//           parentCategoriesCache: state.parentCategoriesCache,
//           shippingMethodsCache: state.shippingMethodsCache,
//         }),
//       },
//     ),
//     {
//       name: "store-admin-store",
//     },
//   ),
// );
