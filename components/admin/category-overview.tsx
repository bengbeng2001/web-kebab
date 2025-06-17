import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  totalProductInCategory: number
}

interface CategoryOverviewProps {
  categories: Category[]
  totalProducts: number
}

export function CategoryOverview({ categories, totalProducts }: CategoryOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Persentase Produk dalam Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
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
                  {Math.round((category.totalProductInCategory / totalProducts) * 100)}% dari total produk
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 