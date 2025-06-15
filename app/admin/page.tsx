'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tag } from "lucide-react"
import { useDashboard } from "@/lib/hooks/use-dashboard"
import { SkeletonCard } from "@/components/skeleton";

export default function DashboardPage() {
    const { data, loading, error } = useDashboard()

    if (loading) {
        return <SkeletonCard/>
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="text-red-500 mb-4">Error: {error}</div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Produk aktif
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalCategories}</div>
                        <p className="text-xs text-muted-foreground">
                            Kategori aktif
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Product Categories Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Persentase Produk dalam Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.categories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-medium">{category.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {category.totalProductInCategory}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        {Math.round((category.totalProductInCategory / data.totalProducts) * 100)}% dari total produk
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>Kategori Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.categories.slice(0, 5).map((category) => (
                            <div key={category.id} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-medium">{category.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        {category.totalProductInCategory} produk
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Ditambahkan: {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Produk Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.products
                            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                            .slice(0, 5)
                            .map((product) => (
                            <div key={product.id} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Stok: {product.stock || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">Rp. {product.price ? product.price.toLocaleString() : '0'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Ditambahkan: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}