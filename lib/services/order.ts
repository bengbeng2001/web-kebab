import { createClient } from "@/lib/supabase/client";
import { Order, OrderProduct, Customer } from '../types/orders_interface'
import { UUID } from "node:crypto";

// Get all orders with their related data
export async function getOrderData() {
  const supabase = createClient();
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users_public!public_users_id (
          id,
          username,
          phone,
          address
        ),
        order_products (*)
      `)
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError
    return {
      totalOrders: orders?.length || 0,
      orders: orders || [],
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get order by ID
export async function getOrderById(id: UUID) {
  const supabase = createClient();
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users_public!public_users_id (
          id,
          username,
          phone,
          address
        ),
        order_products (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return order
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    throw error
  }
}

// Create order
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'customer' | 'order_products'>) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Create order products
export async function createOrderProducts(orderProducts: Omit<OrderProduct, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('order_products')
      .insert(orderProducts)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating order products:', error)
    throw error
  }
}

// Update order
export async function updateOrder(id: UUID, orderData: Partial<Omit<Order, 'id' | 'created_at' | 'customer' | 'order_products'>>) {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)

    if (error) throw error
    const updatedOrder = await getOrderById(id)
    return updatedOrder
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

// Delete order
export async function deleteOrder(id: UUID) {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}

// Get orders by user ID
export async function getOrdersByUserId(userId: UUID) {
  const supabase = createClient(); 
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        user_profile:users_public (
          id,
          username,
          address,
          phone
        ),
        order_products (
          id,
          product_id,
          product_name,
          price,
          quantity,
          subtotal
        )
      `)
      .eq('auth_id', userId) 
      .order('created_at', { ascending: false })

    if (error) throw error
    return orders
  } catch (error) {
    console.error('Error fetching orders by user ID:', error)
    throw error
  }
}
