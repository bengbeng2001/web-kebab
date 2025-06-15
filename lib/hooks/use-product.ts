import { useState, useCallback } from 'react'
import { Product } from '../types/product_interface'
import { 
  getProductData,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/product'
import { UUID } from 'node:crypto';

// Hook untuk mendapatkan semua produk
export function useProducts() {
  const [data, setData] = useState<{ totalProducts: number; products: Product[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getProductData()
      
      // Further ensure categories are arrays in the fetched data before setting state
      const safeProducts = result.products.map(product => ({
        ...product,
        categories: Array.isArray(product.categories) ? product.categories : []
      }))

      setData({ totalProducts: result.totalProducts, products: safeProducts })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Optionally add a fetchProductById if needed
  // const fetchProductById = async (id: UUID) => { ... }

  return { data, loading, error, fetchProducts }
}

// Hook untuk membuat produk baru
export function useCreateProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Product | null>(null)

  const create = async (productData: Omit<Product, 'id' | 'created_at' | 'categories'> & { id_categories: UUID | null }) => {
    try {
      setLoading(true)
      const result = await createProduct(productData)
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

// Hook untuk mengupdate produk
export function useUpdateProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Product | null>(null)

  const update = async (id: UUID, productData: Partial<Omit<Product, 'id' | 'created_at' | 'categories'> & { id_categories: UUID | null }>) => {
    try {
      setLoading(true)
      const result = await updateProduct(id, productData)
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

// Hook untuk menghapus produk
export function useDeleteProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ success: boolean } | null>(null)

  const remove = async (id: UUID) => {
    try {
      setLoading(true)
      const result = await deleteProduct(id)
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
