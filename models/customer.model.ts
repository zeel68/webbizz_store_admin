interface iCustomersInfo {
    customers: iCustomer[]
    pagination: iPagination
}

interface iCustomer {
    _id: string
    name: string
    email: string
    phone?: string
    phone_number?: string
    address?: string
    total_orders?: number
    total_spent?: number
    status: "active" | "inactive"
    created_at: string
    updated_at: string
}