import { createClient } from '@/lib/supabase/client'
import { Category, Product, DashboardData } from '../types/dashboard_interface'

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClient()

  try {
    // Fetch recent categories 
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select(`*`)
      .order('created_at', { ascending: false })
    if (categoryError) throw categoryError

    // Fetch recent products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select(`*`)
      .order('created_at', { ascending: false })
    if (productError) throw productError

    // Transform data
    const transformedCategories: Category[] = categories?.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      totalProductInCategory: products?.filter((prod: any) => prod.id_categories === cat.id).length || 0,
      created_at: cat.created_at,
    })) || []

    const transformedProducts: Product[] = products?.map((prod: any) => ({
      id: prod.id,
      id_categories: prod.id_categories,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      stock: prod.stock || 0,
      created_at: prod.created_at
    })) || []

    return {
      totalProducts: transformedProducts.length,
      totalCategories: transformedCategories.length,
      categories: transformedCategories,
      products: transformedProducts
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
} 