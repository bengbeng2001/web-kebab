import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { UUID } from "node:crypto"

export interface Category {
    id: UUID
    name: string
    description : string
    created_at: Timestamp
}
