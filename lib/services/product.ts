import { createClient } from '@/lib/supabase/client'
import { Product } from '../types/product_interface'
import { UUID } from 'node:crypto'
const supabase = createClient()

// Get all products
export async function getProductData() {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
    if (productsError) throw productsError

    // Transform product data, ensuring categories is always an array (even if it's a single object from a one-to-many join)
    const transformedProduct: Product[] = products?.map((product: any) => ({
      id: product.id,
      // Ensure categories is an array: handle null, object, or array from Supabase
      categories: product.categories 
        ? (Array.isArray(product.categories) ? product.categories : [product.categories]) // If exists, make it an array (wrap object if needed)
        : [], // If null/undefined, default to empty array
      name: product.name,
      description: product.description,
      price: product.price,
      created_at: product.created_at,
    })) || []

    return {
      totalProducts: transformedProduct.length,
      products: transformedProduct,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

// Get single product by ID
export async function getProductById(id: UUID) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    
    // Transform data to ensure categories is always an array
    const transformedProduct: Product | null = product ? ({
        id: product.id,
        categories: product.categories 
          ? (Array.isArray(product.categories) ? product.categories : [product.categories]) 
          : [],
        name: product.name,
        description: product.description,
        price: product.price,
        created_at: product.created_at,
    }) : null

    return transformedProduct
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    throw error
  }
}

// Define a type for product data input (excluding created_at, categories, but including id_categories for one-to-many)
type ProductUpsertData = Omit<Product, 'created_at' | 'categories'> & { id_categories: UUID | null };

// Create new product
export async function createProduct(productData: ProductUpsertData) {
  try {
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) throw productError;
    return newProduct;
  } catch (error) {
    throw error;
  }
}

// Update product
export async function updateProduct(id: UUID, productData: Partial<ProductUpsertData>) {
  try {
    const { error: productError } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id);
    
    if (productError) throw productError;
    const updatedProduct = await getProductById(id);
    return updatedProduct;
  } catch (error) {
    throw error;
  }
}

// Delete product
export async function deleteProduct(id: UUID) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
}

