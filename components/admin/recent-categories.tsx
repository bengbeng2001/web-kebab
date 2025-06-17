import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  description: string
  totalProductInCategory: number
  created_at: string
}

interface RecentCategoriesProps {
  categories: Category[]
}

export function RecentCategories({ categories }: RecentCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.slice(0, 5).map((category) => (
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
  );
} 