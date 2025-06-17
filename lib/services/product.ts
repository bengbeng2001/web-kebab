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
        id,
        name,
        description,
        price,
        stock,
        created_at,
        categories (
          id,
          name,
          description,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Supabase products fetch error:', productsError);
      throw productsError;
    }

    // Transform product data, ensuring categories is always an array
    const transformedProduct: Product[] = products?.map((product: any) => ({
      id: product.id,
      categories: product.categories 
        ? (Array.isArray(product.categories) ? product.categories : [product.categories])
        : [],
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock || 0,
      created_at: product.created_at,
    })) || [];

    return {
      totalProducts: transformedProduct.length,
      products: transformedProduct,
    }
  } catch (error) {
    console.error('Error in getProductData function:', error);
    throw error;
  }
}

// Get single product by ID
export async function getProductById(id: UUID) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        categories (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Supabase product by ID fetch error for ID ${id}:`, error);
      throw error;
    }
    
    // Transform data to ensure categories is always an array
    const transformedProduct: Product | null = product ? ({
        id: product.id,
        categories: product.categories 
          ? (Array.isArray(product.categories) ? product.categories : [product.categories]) 
          : [],
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock || 0,
        created_at: product.created_at,
    }) : null;

    return transformedProduct;
  } catch (error) {
    console.error(`Error in getProductById function for ID ${id}:`, error);
    throw error;
  }
}

// Define a type for product data input (excluding created_at, categories, but including id_categories for one-to-many)
type ProductUpsertData = Omit<Product, 'created_at' | 'categories' | 'id'> & { 
  id_categories: UUID | null;
  id?: UUID; // Make id optional for creation
};

// Create new product
export async function createProduct(productData: ProductUpsertData) {
  try {
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) {
      console.error('Supabase create product error:', productError);
      throw productError;
    }
    return newProduct;
  } catch (error) {
    console.error('Error in createProduct function:', error);
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
    
    if (productError) {
      console.error(`Supabase update product error for ID ${id}:`, productError);
      throw productError;
    }
    const updatedProduct = await getProductById(id);
    return updatedProduct;
  } catch (error) {
    console.error(`Error in updateProduct function for ID ${id}:`, error);
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

    if (error) {
      console.error(`Supabase delete product error for ID ${id}:`, error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error(`Error in deleteProduct function for ID ${id}:`, error);
    throw error;
  }
}

