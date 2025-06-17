import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  stock: number
  price: number
  created_at: string
}

interface RecentProductsProps {
  products: Product[]
}

export function RecentProducts({ products }: RecentProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products
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
  );
} 