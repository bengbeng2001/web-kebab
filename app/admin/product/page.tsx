'use client';

import { useEffect, useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/use-product';
import { Product } from '@/lib/types/product_interface';
import { Category } from '@/lib/types/category_interface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UUID } from 'node:crypto';
import { getCategoryData } from '@/lib/services/category';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus } from 'lucide-react';
import { SkeletonCard } from '@/components/skeleton';

export default function ProductPage() {
  const { data, loading, error, fetchProducts } = useProducts();
  const { create, loading: createLoading, error: createError } = useCreateProduct();
  const { update, loading: updateLoading, error: updateError } = useUpdateProduct();
  const { remove, loading: deleteLoading, error: deleteError } = useDeleteProduct();
  const [categories, setCategories] = useState<Category[]>([]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<string | undefined>(undefined);
  const [editProductName, setEditProductName] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductCategory, setEditProductCategory] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    // Fetch all categories
    const fetchCategories = async () => {
      try {
        const result = await getCategoryData();
        setCategories(result.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (createError || updateError || deleteError) {
      setErrorMessage('Terjadi kesalahan');
    } else {
      setErrorMessage(null);
    }
  }, [createError, updateError, deleteError]);

  const validateNewProduct = () => {
    if (!data?.products) return true; // Allow creation if no products loaded yet
    // Check for duplicate name
    const isNameDuplicate = data.products.some(
      (product: Product) => product.name.toLowerCase() === newProductName.trim().toLowerCase()
    );
    if (isNameDuplicate) {
      setErrorMessage('Nama produk sudah ada');
      return false;
    }

    if (!newProductCategory) {
      setErrorMessage('Pilih kategori produk');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

   const validateEditProduct = () => {
    if (!data?.products || !selectedProduct) return true; 
    // Check for duplicate name, excluding the current product being edited
    const isNameDuplicate = data.products.some(
      (product: Product) => product.id !== selectedProduct.id && product.name.toLowerCase() === editProductName.trim().toLowerCase()
    );
    if (isNameDuplicate) {
      setErrorMessage('Nama produk sudah ada');
      return false;
    }

     if (!editProductCategory) {
      setErrorMessage('Pilih kategori produk');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateNewProduct()) return;
    try {
      await create({
        id: crypto.randomUUID() as UUID,
        name: newProductName.trim(),
        description: newProductDescription.trim(),
        price: parseFloat(newProductPrice),
        id_categories: newProductCategory ? (newProductCategory as UUID) : null,
      });
      setNewProductName('');
      setNewProductDescription('');
      setNewProductPrice('');
      setNewProductCategory(undefined);
      setIsCreateDialogOpen(false);
      fetchProducts();
    } catch (error) {
      setErrorMessage('Gagal membuat produk');
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct || !validateEditProduct()) return;
    try {
      await update(selectedProduct.id, {
        name: editProductName.trim(),
        description: editProductDescription.trim(),
        price: parseFloat(editProductPrice),
        id_categories: editProductCategory ? (editProductCategory as UUID) : null,
      });
      setEditProductName('');
      setEditProductDescription('');
      setEditProductPrice('');
      setEditProductCategory(undefined);
      setSelectedProduct(null);
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      setErrorMessage('Gagal mengupdate produk');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await remove(selectedProduct.id);
      setSelectedProduct(null);
      setIsDeleteDialogOpen(false);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      // Error message is handled by useEffect watching hook errors
    }
  };

  if (loading) return <SkeletonCard/>;
  // Display main error if fetching products failed
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produk</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setNewProductName('');
            setNewProductDescription('');
            setNewProductPrice('');
            setNewProductCategory(undefined);
            setErrorMessage(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Produk</label>
                <Input
                  placeholder="Masukkan Nama Produk"
                  value={newProductName}
                  onChange={(e) => {
                    setNewProductName(e.target.value);
                    setErrorMessage(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <Input
                  placeholder="Masukkan Deskripsi Produk"
                  value={newProductDescription}
                  onChange={(e) => {
                    setNewProductDescription(e.target.value);
                    setErrorMessage(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Harga</label>
                <Input
                  type="number"
                  placeholder="Masukkan Harga Produk"
                  value={newProductPrice}
                  onChange={(e) => {
                    setNewProductPrice(e.target.value);
                    setErrorMessage(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={newProductCategory}
                  onValueChange={setNewProductCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
              {(createError || updateError || deleteError) && (
                <p className="text-sm text-red-500">Memproses...</p>
              )}
              <Button 
                onClick={handleCreate} 
                disabled={createLoading || !newProductName.trim() || !newProductPrice.trim() || newProductCategory === undefined}
                className="w-full"
              >
                {createLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-xs">No</TableHead>
                <TableHead className="min-w-[120px] text-xs">Nama Produk</TableHead>
                <TableHead className="min-w-[180px] text-xs hidden md:table-cell">Deskripsi</TableHead>
                <TableHead className="min-w-[100px] text-xs">Kategori</TableHead>
                <TableHead className="min-w-[90px] text-xs">Harga</TableHead>
                <TableHead className="min-w-[110px] text-xs hidden sm:table-cell">Tanggal Dibuat</TableHead>
                <TableHead className="w-[80px] text-xs text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.products
                .sort((a: Product, b: Product) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((product: Product, index: number) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-xs">{index + 1}</TableCell>
                  <TableCell className="font-medium text-xs">{product.name}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs hidden md:table-cell">{product.description}</TableCell>
                  <TableCell className="text-xs">
                    {product.categories 
                      && Array.isArray(product.categories)
                      && product.categories.length > 0
                      && product.categories.every(cat => cat && typeof cat === 'object' && 'name' in cat)
                      ? product.categories.map((cat: { name: string }) => cat.name).join(', ')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-xs">Rp. {product.price}</TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">
                    {new Date(product.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product);
                          setEditProductName(product.name);
                          setEditProductDescription(product.description);
                          setEditProductPrice(product.price.toString());
                          setEditProductCategory(product.categories?.[0]?.id);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditProductName('');
          setEditProductDescription('');
          setEditProductPrice('');
          setEditProductCategory(undefined);
          setSelectedProduct(null);
          setErrorMessage(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Produk</label>
              <Input
                placeholder="Nama Produk"
                value={editProductName}
                onChange={(e) => setEditProductName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Input
                placeholder="Deskripsi Produk"
                value={editProductDescription}
                onChange={(e) => setEditProductDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Harga</label>
              <Input
                type="number"
                placeholder="Harga Produk"
                value={editProductPrice}
                onChange={(e) => setEditProductPrice(e.target.value)}
              />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={editProductCategory}
                  onValueChange={setEditProductCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            {(createLoading || updateLoading || deleteLoading) && (
              <p className="text-sm text-red-500">Memproses...</p>
            )}
            <Button 
              onClick={handleEdit} 
              disabled={updateLoading || !editProductName.trim() || !editProductPrice.trim() || editProductCategory === undefined}
              className="w-full"
            >
              {updateLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setSelectedProduct(null);
          setErrorMessage(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus "{selectedProduct?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            {(createLoading || updateLoading || deleteLoading) && (
              <p className="text-sm text-red-500">Memproses...</p>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
