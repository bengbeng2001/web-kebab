import { createClient } from '@/lib/supabase/client'
import { Order, OrderProduct, Customer } from '../types/orders_interface'
import { UUID } from 'node:crypto'
import { PostgrestError } from '@supabase/supabase-js'

const supabase = createClient()

// Get all orders with their related data
export async function getOrderData() {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_id,
        created_at,
        printed_at,
        cashier,
        order_type,
        total_items,
        total_price,
        payment_amount,
        income_amount,
        payment_method,
        status,
        customer:customers (
          id,
          name,
          address,
          phone_number
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
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    const transformedOrders: Order[] = orders?.map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      created_at: order.created_at,
      printed_at: order.printed_at,
      cashier: order.cashier,
      order_type: order.order_type,
      total_items: order.total_items,
      total_price: order.total_price,
      payment_amount: order.payment_amount,
      income_amount: order.income_amount,
      payment_method: order.payment_method,
      status: order.status,
      customer: order.customer,
      order_products: order.order_products
    })) || []

    return {
      totalOrders: transformedOrders.length,
      orders: transformedOrders,
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get single order by ID with related data
export async function getOrderById(id: UUID) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          name,
          address,
          phone_number
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
      .eq('id', id)
      .single()

    if (error) throw error
    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

// Create new order
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'customer' | 'order_products'>) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    // Check if it's a Supabase error object and log its details
    if (error && typeof error === 'object' && 'message' in error) {
      const supabaseError = error as PostgrestError;
      console.error('Supabase Error creating order:', supabaseError.message, 'Details:', supabaseError.details, 'Hint:', supabaseError.hint, 'Code:', supabaseError.code);
    } else {
      console.error('Unknown Error creating order:', error);
    }
    throw error
  }
}

// Create order products
export async function createOrderProducts(orderProducts: Omit<OrderProduct, 'id' | 'created_at'>[]) {
  try {
    const { data, error } = await supabase
      .from('order_products')
      .insert(orderProducts)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const supabaseError = error as PostgrestError;
      console.error('Supabase Error creating order products:', supabaseError.message, 'Details:', supabaseError.details, 'Hint:', supabaseError.hint, 'Code:', supabaseError.code);
    } else {
      console.error('Unknown Error creating order products:', error);
    }
    throw error
  }
}

// Update order
export async function updateOrder(id: UUID, orderData: Partial<Omit<Order, 'id' | 'created_at' | 'customer' | 'order_products'>>) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

// Delete order (this will cascade delete order_products due to foreign key constraint)
export async function deleteOrder(id: UUID) {
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

// Get orders by customer ID
export async function getOrdersByCustomerId(customerId: UUID) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_products (
          id,
          product_id,
          product_name,
          price,
          quantity,
          subtotal
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return orders
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    throw error
  }
}
