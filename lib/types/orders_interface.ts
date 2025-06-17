import { UUID } from "node:crypto";

export interface Customer {
  id: UUID;
  username: string;
  address: string;
  phone: string;
}

export interface OrderProduct {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  product_name: string;
  categories_id: UUID;
  categories_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: UUID;
  order_number: number;
  created_at: string;
  printed_at: string | null;
  cashier: string;
  order_type: string;
  total_items: number;
  total_price: number;
  payment_amount: number;
  income_amount: number;
  payment_method: string;
  status: string;
  public_users_id: UUID;
  customer?: Customer;
  order_products?: OrderProduct[];
} 

//one to many
//product(banyak) -> order(1)