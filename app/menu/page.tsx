'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from '@/components/skeleton';
import { ErrorCard } from '@/components/error-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  id_categories: string;
  created_at: string;
  categories: Category;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
      const { categories } = await categoriesResponse.json();
      setCategories(categories);

      // Fetch products
      const productsResponse = await fetch('/api/products');
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const { products } = await productsResponse.json();
      setProducts(products);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter(product => product.categories?.id === selectedCategory)
    : products;

  if (loading) return <SkeletonCard/>;
  if (error) return <ErrorCard message={error} onRetry={fetchData} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Daftar Menu</h1>
      
      <div className="flex flex-col gap-6">
        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Menu</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Category Filter Buttons (Visible on MD and above) */}
            <div className="hidden md:flex flex-wrap gap-2 mb-4">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                Semua Menu
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Category Filter Dropdown (Visible below MD) */}
             <div className="md:hidden mb-4">
                <Select
                   value={selectedCategory || 'all'}
                   onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
                >
                   <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="all">Semua Menu</SelectItem>
                       {categories.map((category) => (
                         <SelectItem key={category.id} value={category.id}>
                           {category.name}
                         </SelectItem>
                       ))}
                   </SelectContent>
                </Select>
             </div>

            {/* Categories Table (Visible on MD and above) */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Deskripsi Kategori</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow 
                      key={category.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        selectedCategory === category.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                    >
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Menu</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Apply responsiveness to the Products Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{product.description}</TableCell>
                      <TableCell>Rp. {(product.price || 0).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
