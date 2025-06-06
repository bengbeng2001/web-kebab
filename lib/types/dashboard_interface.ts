import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { UUID } from "node:crypto"

export interface Category {
    id: UUID
    name: string
    description: string
    totalProductInCategory: number
    created_at: Timestamp
}

export interface Product {
    id: UUID
    id_categories: UUID
    name: string
    description: string
    price: number
    created_at: Timestamp
}

export interface DashboardData {
    totalProducts: number
    totalCategories: number
    categories: Category[]
    products: Product[]
}