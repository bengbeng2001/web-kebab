import { createClient } from '@/lib/supabase/client'
import { Category } from '../types/category_interface'
import { UUID } from 'node:crypto'
const supabase = createClient()

// Get all categories
export async function getCategoryData() {
  try {
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select(`*`)
      .order('created_at', { ascending: false })
    if (categoryError) throw categoryError

    const transformedCategories: Category[] = categories?.map((cat: Category) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      created_at: cat.created_at,
    })) || []

    return {
      totalCategories: transformedCategories.length,
      categories: transformedCategories,
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

// Get single category by ID
export async function getCategoryById(id: UUID) {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    throw error
  }
}

// Create new category
export async function createCategory(categoryData: Omit<Category, 'created_at'>) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Update category
export async function updateCategory(id: UUID, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Delete category
export async function deleteCategory(id: UUID) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

