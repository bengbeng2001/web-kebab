import { useState, useCallback } from 'react'
import { Category } from '../types/category_interface'
import { 
  getCategoryData, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/category'
import { UUID } from 'node:crypto';

// Hook untuk mendapatkan semua kategori
export function useCategories() {
  const [data, setData] = useState<{ totalCategories: number; categories: Category[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getCategoryData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchCategories }
}

// Hook untuk mendapatkan kategori berdasarkan ID
export function useCategory(id: UUID) {
  const [data, setData] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const result = await getCategoryById(id)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchCategory }
}

// Hook untuk membuat kategori baru
export function useCreateCategory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Category | null>(null)

  const create = async (categoryData: Omit<Category, 'created_at'>) => {
    try {
      setLoading(true)
      const result = await createCategory(categoryData)
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

// Hook untuk mengupdate kategori
export function useUpdateCategory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Category | null>(null)

  const update = async (id: UUID, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>) => {
    try {
      setLoading(true)
      const result = await updateCategory(id, categoryData)
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

// Hook untuk menghapus kategori
export function useDeleteCategory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Category | null>(null)

  const remove = async (id: UUID) => {
    try {
      setLoading(true)
      const result = await deleteCategory(id)
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
