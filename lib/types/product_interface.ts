import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { UUID } from "node:crypto"
import { Category } from "./category_interface"

export interface Product {
    id: UUID
    categories?: Category[]
    name: string
    description: string
    price: number
    created_at: Timestamp
}