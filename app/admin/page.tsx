import { Package, Tag } from "lucide-react"
import { SummaryCard } from "@/components/admin/summary-card"
import { CategoryOverview } from "@/components/admin/category-overview"
import { RecentCategories } from "@/components/admin/recent-categories"
import { RecentProducts } from "@/components/admin/recent-products"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

async function getDashboardData() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users_public')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Get dashboard data
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  return {
    totalProducts: products?.length || 0,
    totalCategories: categories?.length || 0,
    products: products || [],
    categories: categories?.map(category => ({
      ...category,
      totalProductInCategory: products?.filter(p => p.category_id === category.id).length || 0
    })) || []
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SummaryCard 
          title="Total Produk" 
          value={data.totalProducts} 
          subtitle="Produk aktif" 
          icon={Package} 
        />
        <SummaryCard 
          title="Total Kategori" 
          value={data.totalCategories} 
          subtitle="Kategori aktif" 
          icon={Tag} 
        />
      </div>

      {/* Category Overview */}
      <CategoryOverview 
        categories={data.categories} 
        totalProducts={data.totalProducts} 
      />

      {/* Recent Categories */}
      <RecentCategories categories={data.categories} />

      {/* Recent Products */}
      <RecentProducts products={data.products} />
    </div>
  );
}