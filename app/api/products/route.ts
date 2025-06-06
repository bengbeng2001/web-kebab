import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }
} 