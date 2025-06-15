import { useState } from 'react'
import { Order, OrderProduct } from '../types/orders_interface'
import { 
  getOrderData,
  getOrderById,
  createOrder,
  createOrderProducts,
  updateOrder,
  deleteOrder,
  getOrdersByCustomerId
} from '../services/order'
import { UUID } from 'node:crypto'

// Hook untuk mendapatkan semua order
export function useOrders() {
  const [data, setData] = useState<{ totalOrders: number; orders: Order[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const result = await getOrderData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchOrders }
}

// Hook untuk mendapatkan order berdasarkan ID
export function useOrder(id: UUID) {
  const [data, setData] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const result = await getOrderById(id)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchOrder }
}

// Hook untuk mendapatkan order berdasarkan customer ID
export function useCustomerOrders(customerId: UUID) {
  const [data, setData] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true)
      const result = await getOrdersByCustomerId(customerId)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchCustomerOrders }
}

// Hook untuk membuat order baru
export function useCreateOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Order | null>(null)

  const create = async (orderData: Omit<Order, 'id' | 'created_at' | 'customer' | 'order_products'>) => {
    try {
      setLoading(true)
      const result = await createOrder(orderData)
      setData(result)
      setError(null)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, data, loading, error }
}

// Hook untuk membuat order products
export function useCreateOrderProducts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OrderProduct[] | null>(null)

  const create = async (orderProducts: Omit<OrderProduct, 'id' | 'created_at'>[]) => {
    try {
      setLoading(true)
      const result = await createOrderProducts(orderProducts)
      setData(result)
      setError(null)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, data, loading, error }
}

// Hook untuk mengupdate order
export function useUpdateOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Order | null>(null)

  const update = async (id: UUID, orderData: Partial<Omit<Order, 'id' | 'created_at' | 'customer' | 'order_products'>>) => {
    try {
      setLoading(true)
      const result = await updateOrder(id, orderData)
      setData(result)
      setError(null)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { update, data, loading, error }
}

// Hook untuk menghapus order
export function useDeleteOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ success: boolean } | null>(null)

  const remove = async (id: UUID) => {
    try {
      setLoading(true)
      const result = await deleteOrder(id)
      setData(result)
      setError(null)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { remove, data, loading, error }
}
