interface iPagination {
    page: number
    limit: number
    total: number
    totalPages: number
    pages?: number
    hasNext?: boolean
    hasPrev?: boolean
}