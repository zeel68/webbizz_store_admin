

// export interface CategoryConfig {
//     availableTags: string[]
//     productAttributes: string[]
//     searchFilters: FilterConfig[]
//     displaySettings: DisplaySettings
// }

// export interface FilterConfig {
//     key: string
//     label: string
//     type: "checkbox" | "range" | "select"
//     options?: string[]
// }

// export interface DisplaySettings {
//     gridColumns: number
//     sortOptions: string[]
//     defaultSort: string
//     showFilters: boolean
// }



// import { StoreCategory } from "@/models/store.model"
// import type { iProduct } from "@/models/product.model"

// // Store Categories Configuration
// export const CATEGORY_CONFIGS = {
//     [StoreCategory.JEWELRY]: {
//         availableTags: ["Metal", "Gemstone", "Occasion", "Gender", "Purity", "Weight"],
//         productAttributes: ["metal_type", "gemstone", "purity", "weight", "occasion", "gender"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             { key: "metal_type", label: "Metal", type: "checkbox", options: ["Gold", "Silver", "Platinum", "Diamond"] },
//             { key: "gemstone", label: "Gemstone", type: "checkbox", options: ["Diamond", "Ruby", "Emerald", "Sapphire"] },
//             { key: "occasion", label: "Occasion", type: "checkbox", options: ["Wedding", "Party", "Daily Wear", "Festival"] },
//             { key: "gender", label: "Gender", type: "checkbox", options: ["Men", "Women", "Unisex"] },
//         ],
//         displaySettings: {
//             gridColumns: 4,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Newest", "Popular"],
//             defaultSort: "Popular",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.FASHION]: {
//         availableTags: ["Size", "Color", "Material", "Occasion", "Sleeve Type", "Neckline"],
//         productAttributes: ["size", "color", "material", "occasion", "sleeve_type", "neckline"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             { key: "size", label: "Size", type: "checkbox", options: ["XS", "S", "M", "L", "XL", "XXL"] },
//             { key: "color", label: "Color", type: "checkbox", options: ["Red", "Blue", "Green", "Black", "White"] },
//             { key: "material", label: "Material", type: "checkbox", options: ["Cotton", "Silk", "Polyester", "Wool"] },
//             { key: "occasion", label: "Occasion", type: "checkbox", options: ["Casual", "Formal", "Party", "Wedding"] },
//         ],
//         displaySettings: {
//             gridColumns: 3,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Newest", "Popular"],
//             defaultSort: "Newest",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.TOYS]: {
//         availableTags: ["Age Group", "Category", "Brand", "Safety Rating", "Battery Required"],
//         productAttributes: ["age_group", "toy_category", "brand", "safety_rating", "battery_required"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             {
//                 key: "age_group",
//                 label: "Age Group",
//                 type: "checkbox",
//                 options: ["0-2 years", "3-5 years", "6-8 years", "9+ years"],
//             },
//             {
//                 key: "toy_category",
//                 label: "Category",
//                 type: "checkbox",
//                 options: ["Educational", "Action", "Dolls", "Building"],
//             },
//             { key: "brand", label: "Brand", type: "checkbox", options: ["LEGO", "Mattel", "Hasbro", "Fisher-Price"] },
//         ],
//         displaySettings: {
//             gridColumns: 4,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Age Group", "Popular"],
//             defaultSort: "Popular",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.ELECTRONICS]: {
//         availableTags: ["Brand", "Category", "Features", "Warranty", "Power"],
//         productAttributes: ["brand", "category", "features", "warranty", "power_consumption"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             { key: "brand", label: "Brand", type: "checkbox", options: ["Apple", "Samsung", "Sony", "LG"] },
//             { key: "category", label: "Category", type: "checkbox", options: ["Smartphones", "Laptops", "TVs", "Audio"] },
//         ],
//         displaySettings: {
//             gridColumns: 3,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Brand", "Rating"],
//             defaultSort: "Rating",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.HOME_DECOR]: {
//         availableTags: ["Room", "Style", "Material", "Color", "Size"],
//         productAttributes: ["room_type", "style", "material", "color", "dimensions"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             { key: "room_type", label: "Room", type: "checkbox", options: ["Living Room", "Bedroom", "Kitchen", "Bathroom"] },
//             { key: "style", label: "Style", type: "checkbox", options: ["Modern", "Traditional", "Minimalist", "Rustic"] },
//         ],
//         displaySettings: {
//             gridColumns: 3,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Newest", "Popular"],
//             defaultSort: "Popular",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.BOOKS]: {
//         availableTags: ["Genre", "Author", "Language", "Format", "Age Group"],
//         productAttributes: ["genre", "author", "language", "format", "target_age"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             { key: "genre", label: "Genre", type: "checkbox", options: ["Fiction", "Non-Fiction", "Mystery", "Romance"] },
//             { key: "format", label: "Format", type: "checkbox", options: ["Hardcover", "Paperback", "E-book", "Audiobook"] },
//         ],
//         displaySettings: {
//             gridColumns: 4,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Author", "Rating"],
//             defaultSort: "Rating",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.SPORTS]: {
//         availableTags: ["Sport", "Brand", "Size", "Material", "Level"],
//         productAttributes: ["sport_type", "brand", "size", "material", "skill_level"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             { key: "sport_type", label: "Sport", type: "checkbox", options: ["Football", "Basketball", "Tennis", "Cricket"] },
//             { key: "brand", label: "Brand", type: "checkbox", options: ["Nike", "Adidas", "Puma", "Under Armour"] },
//         ],
//         displaySettings: {
//             gridColumns: 3,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Brand", "Popular"],
//             defaultSort: "Popular",
//             showFilters: true,
//         },
//     },
//     [StoreCategory.BEAUTY]: {
//         availableTags: ["Category", "Brand", "Skin Type", "Concern", "Ingredients"],
//         productAttributes: ["product_category", "brand", "skin_type", "concern", "key_ingredients"],
//         searchFilters: [
//             { key: "price", label: "Price Range", type: "range" },
//             {
//                 key: "product_category",
//                 label: "Category",
//                 type: "checkbox",
//                 options: ["Skincare", "Makeup", "Haircare", "Fragrance"],
//             },
//             { key: "skin_type", label: "Skin Type", type: "checkbox", options: ["Oily", "Dry", "Combination", "Sensitive"] },
//         ],
//         displaySettings: {
//             gridColumns: 4,
//             sortOptions: ["Price: Low to High", "Price: High to Low", "Brand", "Rating"],
//             defaultSort: "Rating",
//             showFilters: true,
//         },
//     },
// }

// // Mock Stores Data
// export const MOCK_STORES = [
//     {
//         id: "store_1",
//         name: "Elegant Jewelry",
//         slug: "elegant-jewelry",
//         description: "Premium jewelry collection for special occasions",
//         category: StoreCategory.JEWELRY,
//         ownerId: "owner_1",
//         isActive: true,
//         settings: {
//             shipping: {
//                 freeShippingThreshold: 100,
//                 shippingRates: [
//                     { region: "Local", rate: 5 },
//                     { region: "National", rate: 15 },
//                     { region: "International", rate: 25 },
//                 ],
//             },
//             payment: {
//                 acceptedMethods: ["Credit Card", "PayPal", "Bank Transfer"],
//                 currency: "USD",
//             },
//             business: {
//                 hours: "9 AM - 6 PM",
//                 phone: "+1-555-0123",
//                 email: "contact@elegantjewelry.com",
//                 address: "123 Jewelry Street, Diamond City, DC 12345",
//             },
//             tax: {
//                 rate: 8.5,
//                 included: false,
//             },
//         },
//         theme: {
//             colors: {
//                 primary: "#1a1a1a",
//                 secondary: "#ffffff",
//                 accent: "#d4af37",
//             },
//             fonts: {
//                 heading: "Playfair Display",
//                 body: "Inter",
//             },
//             layout: "modern",
//             headerStyle: "fixed",
//             customCSS: "",
//         },
//         branding: {
//             logo: "/placeholder.svg?height=60&width=200",
//             favicon: "/placeholder.svg?height=32&width=32",
//             customDomain: "",
//         },
//         createdAt: "2024-01-01",
//         updatedAt: "2024-01-15",
//     },
//     {
//         id: "store_2",
//         name: "Fashion Paradise",
//         slug: "fashion-paradise",
//         description: "Trendy fashion for modern lifestyle",
//         category: StoreCategory.FASHION,
//         ownerId: "owner_2",
//         isActive: true,
//         settings: {
//             shipping: {
//                 freeShippingThreshold: 75,
//                 shippingRates: [
//                     { region: "Local", rate: 3 },
//                     { region: "National", rate: 10 },
//                     { region: "International", rate: 20 },
//                 ],
//             },
//             payment: {
//                 acceptedMethods: ["Credit Card", "PayPal", "Apple Pay"],
//                 currency: "USD",
//             },
//             business: {
//                 hours: "10 AM - 8 PM",
//                 phone: "+1-555-0456",
//                 email: "hello@fashionparadise.com",
//                 address: "456 Fashion Ave, Style City, SC 67890",
//             },
//             tax: {
//                 rate: 7.5,
//                 included: false,
//             },
//         },
//         theme: {
//             colors: {
//                 primary: "#ff6b6b",
//                 secondary: "#ffffff",
//                 accent: "#4ecdc4",
//             },
//             fonts: {
//                 heading: "Montserrat",
//                 body: "Open Sans",
//             },
//             layout: "classic",
//             headerStyle: "static",
//             customCSS: "",
//         },
//         branding: {
//             logo: "/placeholder.svg?height=60&width=200",
//             favicon: "/placeholder.svg?height=32&width=32",
//             customDomain: "",
//         },
//         createdAt: "2024-01-05",
//         updatedAt: "2024-01-20",
//     },
//     {
//         id: "store_3",
//         name: "Toy Kingdom",
//         slug: "toy-kingdom",
//         description: "Fun and educational toys for children",
//         category: StoreCategory.TOYS,
//         ownerId: "owner_3",
//         isActive: true,
//         settings: {
//             shipping: {
//                 freeShippingThreshold: 50,
//                 shippingRates: [
//                     { region: "Local", rate: 4 },
//                     { region: "National", rate: 12 },
//                     { region: "International", rate: 18 },
//                 ],
//             },
//             payment: {
//                 acceptedMethods: ["Credit Card", "PayPal"],
//                 currency: "USD",
//             },
//             business: {
//                 hours: "9 AM - 7 PM",
//                 phone: "+1-555-0789",
//                 email: "info@toykingdom.com",
//                 address: "789 Play Street, Fun City, FC 13579",
//             },
//             tax: {
//                 rate: 6.0,
//                 included: false,
//             },
//         },
//         theme: {
//             colors: {
//                 primary: "#ffd93d",
//                 secondary: "#6bcf7f",
//                 accent: "#ff6b9d",
//             },
//             fonts: {
//                 heading: "Comic Neue",
//                 body: "Nunito",
//             },
//             layout: "playful",
//             headerStyle: "transparent",
//             customCSS: "",
//         },
//         branding: {
//             logo: "/placeholder.svg?height=60&width=200",
//             favicon: "/placeholder.svg?height=32&width=32",
//             customDomain: "",
//         },
//         createdAt: "2024-01-10",
//         updatedAt: "2024-01-25",
//     },
// ]

// // Mock Products Data
// export const MOCK_PRODUCTS: Record<StoreCategory, iProduct[]> = {
//     [StoreCategory.JEWELRY]: [
//         {
//             id: "j1",
//             name: "Diamond Necklace Set",
//             description: "Elegant diamond necklace with matching earrings crafted in 18K gold",
//             price: 25000,
//             discountPrice: 20000,
//             images: [
//                 "/placeholder.svg?height=400&width=400",
//                 "/placeholder.svg?height=400&width=400",
//                 "/placeholder.svg?height=400&width=400",
//             ],
//             category: "Necklaces",
//             storeCategory: StoreCategory.JEWELRY,
//             storeId: "store_1",
//             brand: "Royal Gems",
//             sku: "DN001",
//             stock: 5,
//             isActive: true,
//             tags: [
//                 { tagId: "1", tagName: "Metal", tagType: "material", value: "Gold", category: StoreCategory.JEWELRY },
//                 { tagId: "2", tagName: "Occasion", tagType: "occasion", value: "Wedding", category: StoreCategory.JEWELRY },
//                 { tagId: "3", tagName: "Gender", tagType: "gender", value: "Women", category: StoreCategory.JEWELRY },
//             ],
//             attributes: {
//                 metal_type: "Gold",
//                 gemstone: "Diamond",
//                 purity: "18K",
//                 weight: 25.5,
//                 occasion: "Wedding",
//                 gender: "Women",
//             },
//             createdAt: "2024-01-01",
//             updatedAt: "2024-01-01",
//         },
//         {
//             id: "j2",
//             name: "Silver Bracelet",
//             description: "Handcrafted silver bracelet with intricate patterns",
//             price: 1500,
//             discountPrice: 1200,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Bracelets",
//             storeCategory: StoreCategory.JEWELRY,
//             storeId: "store_1",
//             brand: "Silver Craft",
//             sku: "SB002",
//             stock: 12,
//             isActive: true,
//             tags: [
//                 { tagId: "4", tagName: "Metal", tagType: "material", value: "Silver", category: StoreCategory.JEWELRY },
//                 { tagId: "5", tagName: "Occasion", tagType: "occasion", value: "Daily Wear", category: StoreCategory.JEWELRY },
//             ],
//             attributes: {
//                 metal_type: "Silver",
//                 purity: "925",
//                 weight: 15.2,
//                 occasion: "Daily Wear",
//                 gender: "Unisex",
//             },
//             createdAt: "2024-01-02",
//             updatedAt: "2024-01-02",
//         },
//         {
//             id: "j3",
//             name: "Ruby Ring",
//             description: "Stunning ruby ring set in platinum with diamond accents",
//             price: 8500,
//             discountPrice: 7500,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Rings",
//             storeCategory: StoreCategory.JEWELRY,
//             storeId: "store_1",
//             brand: "Precious Stones",
//             sku: "RR003",
//             stock: 3,
//             isActive: true,
//             tags: [
//                 { tagId: "6", tagName: "Metal", tagType: "material", value: "Platinum", category: StoreCategory.JEWELRY },
//                 { tagId: "7", tagName: "Gemstone", tagType: "gemstone", value: "Ruby", category: StoreCategory.JEWELRY },
//             ],
//             attributes: {
//                 metal_type: "Platinum",
//                 gemstone: "Ruby",
//                 purity: "950",
//                 weight: 8.3,
//                 occasion: "Party",
//                 gender: "Women",
//             },
//             createdAt: "2024-01-03",
//             updatedAt: "2024-01-03",
//         },
//     ],
//     [StoreCategory.FASHION]: [
//         {
//             id: "f1",
//             name: "Designer Anarkali Suit",
//             description: "Beautiful embroidered anarkali suit for special occasions",
//             price: 4999,
//             discountPrice: 3999,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Suits",
//             storeCategory: StoreCategory.FASHION,
//             storeId: "store_2",
//             brand: "Ethnic Couture",
//             sku: "AS001",
//             stock: 15,
//             isActive: true,
//             tags: [
//                 { tagId: "8", tagName: "Size", tagType: "size", value: "M", category: StoreCategory.FASHION },
//                 { tagId: "9", tagName: "Color", tagType: "color", value: "Red", category: StoreCategory.FASHION },
//             ],
//             attributes: {
//                 size: "M",
//                 color: "Red",
//                 material: "Silk",
//                 occasion: "Wedding",
//                 sleeve_type: "Full Sleeve",
//                 neckline: "Round",
//             },
//             createdAt: "2024-01-01",
//             updatedAt: "2024-01-01",
//         },
//         {
//             id: "f2",
//             name: "Cotton Casual Shirt",
//             description: "Comfortable cotton shirt for everyday wear",
//             price: 899,
//             discountPrice: 699,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Shirts",
//             storeCategory: StoreCategory.FASHION,
//             storeId: "store_2",
//             brand: "Casual Wear",
//             sku: "CS002",
//             stock: 25,
//             isActive: true,
//             tags: [
//                 { tagId: "10", tagName: "Size", tagType: "size", value: "L", category: StoreCategory.FASHION },
//                 { tagId: "11", tagName: "Color", tagType: "color", value: "Blue", category: StoreCategory.FASHION },
//             ],
//             attributes: {
//                 size: "L",
//                 color: "Blue",
//                 material: "Cotton",
//                 occasion: "Casual",
//                 sleeve_type: "Half Sleeve",
//                 neckline: "Collar",
//             },
//             createdAt: "2024-01-02",
//             updatedAt: "2024-01-02",
//         },
//         {
//             id: "f3",
//             name: "Evening Gown",
//             description: "Elegant evening gown perfect for formal events",
//             price: 7999,
//             discountPrice: 6999,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Dresses",
//             storeCategory: StoreCategory.FASHION,
//             storeId: "store_2",
//             brand: "Formal Elegance",
//             sku: "EG003",
//             stock: 8,
//             isActive: true,
//             tags: [
//                 { tagId: "12", tagName: "Size", tagType: "size", value: "S", category: StoreCategory.FASHION },
//                 { tagId: "13", tagName: "Color", tagType: "color", value: "Black", category: StoreCategory.FASHION },
//             ],
//             attributes: {
//                 size: "S",
//                 color: "Black",
//                 material: "Polyester",
//                 occasion: "Formal",
//                 sleeve_type: "Sleeveless",
//                 neckline: "V-Neck",
//             },
//             createdAt: "2024-01-03",
//             updatedAt: "2024-01-03",
//         },
//     ],
//     [StoreCategory.TOYS]: [
//         {
//             id: "t1",
//             name: "Educational Building Blocks",
//             description: "Colorful building blocks to enhance creativity and motor skills",
//             price: 2999,
//             discountPrice: 2499,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Educational",
//             storeCategory: StoreCategory.TOYS,
//             storeId: "store_3",
//             brand: "Learning Fun",
//             sku: "BB001",
//             stock: 20,
//             isActive: true,
//             tags: [
//                 { tagId: "14", tagName: "Age Group", tagType: "age", value: "3-5 years", category: StoreCategory.TOYS },
//                 { tagId: "15", tagName: "Category", tagType: "category", value: "Educational", category: StoreCategory.TOYS },
//             ],
//             attributes: {
//                 age_group: "3-5 years",
//                 toy_category: "Educational",
//                 brand: "Learning Fun",
//                 safety_rating: "CE",
//                 battery_required: false,
//             },
//             createdAt: "2024-01-01",
//             updatedAt: "2024-01-01",
//         },
//         {
//             id: "t2",
//             name: "Remote Control Car",
//             description: "High-speed remote control car with LED lights",
//             price: 3999,
//             discountPrice: 3499,
//             images: ["/placeholder.svg?height=400&width=400"],
//             category: "Action",
//             storeCategory: StoreCategory.TOYS,
//             storeId: "store_3",
//             brand: "Speed Racers",
//             sku: "RC002",
//             stock: 15,
//             isActive: true,
//             tags: [
//                 { tagId: "16", tagName: "Age Group", tagType: "age", value: "6-8 years", category: StoreCategory.TOYS },
//                 { tagId: "17", tagName: "Category", tagType: "category", value: "Action", category: StoreCategory.TOYS },
//             ],
//             attributes: {
//                 age_group: "6-8 years",
//                 toy_category: "Action",
//                 brand: "Speed Racers",
//                 safety_rating: "ASTM",
//                 battery_required: true,
//             },
//             createdAt: "2024-01-02",
//             updatedAt: "2024-01-02",
//         },
//     ],
//     [StoreCategory.ELECTRONICS]: [],
//     [StoreCategory.HOME_DECOR]: [],
//     [StoreCategory.BOOKS]: [],
//     [StoreCategory.SPORTS]: [],
//     [StoreCategory.BEAUTY]: [],
// }

// // Mock Users Data
// export const MOCK_USERS = [
//     {
//         id: "admin_1",
//         name: "Super Admin",
//         email: "admin@platform.com",
//         role: "ADMIN",
//         image: "/placeholder.svg?height=40&width=40",
//         createdAt: "2024-01-01",
//     },
//     {
//         id: "owner_1",
//         name: "John Doe",
//         email: "john@elegantjewelry.com",
//         role: "OWNER",
//         image: "/placeholder.svg?height=40&width=40",
//         storeId: "store_1",
//         createdAt: "2024-01-01",
//     },
//     {
//         id: "owner_2",
//         name: "Jane Smith",
//         email: "jane@fashionparadise.com",
//         role: "OWNER",
//         image: "/placeholder.svg?height=40&width=40",
//         storeId: "store_2",
//         createdAt: "2024-01-05",
//     },
//     {
//         id: "owner_3",
//         name: "Mike Johnson",
//         email: "mike@toykingdom.com",
//         role: "OWNER",
//         image: "/placeholder.svg?height=40&width=40",
//         storeId: "store_3",
//         createdAt: "2024-01-10",
//     },
//     {
//         id: "customer_1",
//         name: "Alice Wilson",
//         email: "alice@email.com",
//         role: "CUSTOMER",
//         image: "/placeholder.svg?height=40&width=40",
//         createdAt: "2024-01-15",
//     },
// ]

// // Mock Orders Data
// export const MOCK_ORDERS = [
//     {
//         id: "order_1",
//         customerId: "customer_1",
//         storeId: "store_1",
//         items: [
//             {
//                 productId: "j1",
//                 quantity: 1,
//                 price: 20000,
//                 name: "Diamond Necklace Set",
//             },
//         ],
//         total: 20000,
//         status: "Processing",
//         shippingAddress: {
//             name: "Alice Wilson",
//             street: "123 Main St",
//             city: "New York",
//             state: "NY",
//             zipCode: "10001",
//             country: "USA",
//         },
//         createdAt: "2024-01-20",
//         updatedAt: "2024-01-20",
//     },
//     {
//         id: "order_2",
//         customerId: "customer_1",
//         storeId: "store_2",
//         items: [
//             {
//                 productId: "f1",
//                 quantity: 1,
//                 price: 3999,
//                 name: "Designer Anarkali Suit",
//             },
//             {
//                 productId: "f2",
//                 quantity: 2,
//                 price: 699,
//                 name: "Cotton Casual Shirt",
//             },
//         ],
//         total: 5397,
//         status: "Shipped",
//         shippingAddress: {
//             name: "Alice Wilson",
//             street: "123 Main St",
//             city: "New York",
//             state: "NY",
//             zipCode: "10001",
//             country: "USA",
//         },
//         createdAt: "2024-01-18",
//         updatedAt: "2024-01-19",
//     },
// ]

// // Dashboard Stats Data
// export const MOCK_DASHBOARD_STATS = {
//     superAdmin: {
//         totalStores: 24,
//         activeUsers: 1234,
//         totalProducts: 5678,
//         revenue: 45678,
//         recentStores: [
//             { name: "Fashion Paradise", category: "Fashion", status: "Active", owner: "John Doe" },
//             { name: "Jewelry World", category: "Jewelry", status: "Pending", owner: "Jane Smith" },
//             { name: "Toy Kingdom", category: "Toys", status: "Active", owner: "Mike Johnson" },
//             { name: "Tech Hub", category: "Electronics", status: "Active", owner: "Sarah Wilson" },
//         ],
//     },
//     storeOwner: {
//         totalProducts: 156,
//         ordersToday: 23,
//         customers: 1234,
//         revenue: 2345,
//         recentOrders: [
//             { id: "#1234", customer: "John Doe", amount: "$89.99", status: "Processing" },
//             { id: "#1235", customer: "Jane Smith", amount: "$156.50", status: "Shipped" },
//             { id: "#1236", customer: "Mike Johnson", amount: "$67.25", status: "Delivered" },
//             { id: "#1237", customer: "Sarah Wilson", amount: "$234.00", status: "Processing" },
//         ],
//     },
// }

// // Featured Products for Store Homepage
// export const MOCK_FEATURED_PRODUCTS = [
//     {
//         id: 1,
//         name: "Premium Cotton T-Shirt",
//         price: 29.99,
//         originalPrice: 39.99,
//         image: "/placeholder.svg?height=300&width=300",
//         rating: 4.5,
//         reviews: 128,
//     },
//     {
//         id: 2,
//         name: "Denim Jacket",
//         price: 89.99,
//         originalPrice: 119.99,
//         image: "/placeholder.svg?height=300&width=300",
//         rating: 4.8,
//         reviews: 89,
//     },
//     {
//         id: 3,
//         name: "Summer Dress",
//         price: 59.99,
//         originalPrice: 79.99,
//         image: "/placeholder.svg?height=300&width=300",
//         rating: 4.6,
//         reviews: 156,
//     },
//     {
//         id: 4,
//         name: "Casual Sneakers",
//         price: 79.99,
//         originalPrice: 99.99,
//         image: "/placeholder.svg?height=300&width=300",
//         rating: 4.7,
//         reviews: 203,
//     },
// ]

// // Categories for Homepage
// export const MOCK_CATEGORIES = [
//     {
//         id: 1,
//         name: "Women's Fashion",
//         image: "/placeholder.svg?height=200&width=200",
//         productCount: 245,
//     },
//     {
//         id: 2,
//         name: "Men's Fashion",
//         image: "/placeholder.svg?height=200&width=200",
//         productCount: 189,
//     },
//     {
//         id: 3,
//         name: "Accessories",
//         image: "/placeholder.svg?height=200&width=200",
//         productCount: 156,
//     },
//     {
//         id: 4,
//         name: "Footwear",
//         image: "/placeholder.svg?height=200&width=200",
//         productCount: 98,
//     },
// ]

// // Navigation Menu Items
// export const NAVIGATION_ITEMS = {
//     superAdmin: [
//         { name: "Dashboard", href: "/OBS", icon: "BarChart3" },
//         { name: "Stores", href: "/OBS/stores", icon: "Store" },
//         { name: "Users", href: "/OBS/users", icon: "Users" },
//         { name: "Analytics", href: "/OBS/analytics", icon: "TrendingUp" },
//         { name: "Settings", href: "/OBS/settings", icon: "Settings" },
//     ],
//     storeOwner: [
//         { name: "Dashboard", href: "/OW", icon: "BarChart3" },
//         { name: "Products", href: "/OW/products", icon: "Package" },
//         { name: "Orders", href: "/OW/orders", icon: "ShoppingCart" },
//         { name: "Customers", href: "/OW/customers", icon: "Users" },
//         { name: "Analytics", href: "/OW/analytics", icon: "TrendingUp" },
//         { name: "Settings", href: "/OW/settings", icon: "Settings" },
//     ],
// }

// // Theme Presets
// export const THEME_PRESETS = [
//     {
//         name: "Modern Dark",
//         colors: {
//             primary: "#1a1a1a",
//             secondary: "#ffffff",
//             accent: "#3b82f6",
//         },
//         fonts: {
//             heading: "Inter",
//             body: "Inter",
//         },
//     },
//     {
//         name: "Elegant Gold",
//         colors: {
//             primary: "#1a1a1a",
//             secondary: "#ffffff",
//             accent: "#d4af37",
//         },
//         fonts: {
//             heading: "Playfair Display",
//             body: "Inter",
//         },
//     },
//     {
//         name: "Fresh Green",
//         colors: {
//             primary: "#065f46",
//             secondary: "#ffffff",
//             accent: "#10b981",
//         },
//         fonts: {
//             heading: "Montserrat",
//             body: "Open Sans",
//         },
//     },
//     {
//         name: "Vibrant Pink",
//         colors: {
//             primary: "#be185d",
//             secondary: "#ffffff",
//             accent: "#ec4899",
//         },
//         fonts: {
//             heading: "Poppins",
//             body: "Nunito",
//         },
//     },
// ]

// // Filter Options for Product Search
// export const FILTER_OPTIONS = {
//     priceRanges: [
//         { label: "Under $25", min: 0, max: 25 },
//         { label: "$25 - $50", min: 25, max: 50 },
//         { label: "$50 - $100", min: 50, max: 100 },
//         { label: "$100 - $200", min: 100, max: 200 },
//         { label: "Over $200", min: 200, max: 999999 },
//     ],
//     sortOptions: [
//         { label: "Most Popular", value: "popular" },
//         { label: "Newest", value: "newest" },
//         { label: "Price: Low to High", value: "price-low" },
//         { label: "Price: High to Low", value: "price-high" },
//         { label: "Highest Rated", value: "rating" },
//         { label: "Best Selling", value: "bestselling" },
//     ],
// }

// // Store Creation Templates
// export const STORE_TEMPLATES = {
//     [StoreCategory.JEWELRY]: {
//         name: "Jewelry Store",
//         description: "Premium jewelry collection for special occasions",
//         theme: {
//             colors: {
//                 primary: "#1a1a1a",
//                 secondary: "#ffffff",
//                 accent: "#d4af37",
//             },
//             fonts: {
//                 heading: "Playfair Display",
//                 body: "Inter",
//             },
//             layout: "elegant",
//         },
//     },
//     [StoreCategory.FASHION]: {
//         name: "Fashion Store",
//         description: "Trendy fashion for modern lifestyle",
//         theme: {
//             colors: {
//                 primary: "#ff6b6b",
//                 secondary: "#ffffff",
//                 accent: "#4ecdc4",
//             },
//             fonts: {
//                 heading: "Montserrat",
//                 body: "Open Sans",
//             },
//             layout: "modern",
//         },
//     },
//     [StoreCategory.TOYS]: {
//         name: "Toy Store",
//         description: "Fun and educational toys for children",
//         theme: {
//             colors: {
//                 primary: "#ffd93d",
//                 secondary: "#6bcf7f",
//                 accent: "#ff6b9d",
//             },
//             fonts: {
//                 heading: "Comic Neue",
//                 body: "Nunito",
//             },
//             layout: "playful",
//         },
//     },
// }
