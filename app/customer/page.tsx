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
import { useCategories } from '@/lib/hooks/use-category';
import { useProducts } from '@/lib/hooks/use-product';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, fetchCategories } = useCategories();
  const { data: productsData, loading: productsLoading, error: productsError, fetchProducts } = useProducts();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory && productsData
    ? productsData.products.filter(product => 
        product.categories?.some(category => category.id === selectedCategory)
      )
    : productsData?.products || [];

  if (categoriesLoading || productsLoading) return <SkeletonCard/>;
  if (categoriesError || productsError) return <ErrorCard message={categoriesError || productsError || 'An error occurred'} onRetry={() => {
    fetchCategories();
    fetchProducts();
  }} />;

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
              {categoriesData?.categories.map((category) => (
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
                  {categoriesData?.categories.map((category) => (
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
                  {categoriesData?.categories.map((category) => (
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
