'use client';

import { useEffect, useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/use-category';
import { Category } from '@/lib/types/category_interface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UUID } from 'node:crypto';
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
import { Pencil, Trash2, Plus } from 'lucide-react';
import { SkeletonCard } from '@/components/skeleton';

export default function CategoryPage() {
  const { data, loading, error, fetchCategories } = useCategories();
  const { create, loading: createLoading } = useCreateCategory();
  const { update, loading: updateLoading } = useUpdateCategory();
  const { remove, loading: deleteLoading } = useDeleteCategory();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateNewCategory = () => {
    if (!data?.categories) return false;
    // Cek nama duplikat
    const isNameDuplicate = data.categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.toLowerCase()
    );
    if (isNameDuplicate) {
      setErrorMessage('Nama Kategori sudah digunakan');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleCreate = async () => {
    try {
      if (!validateNewCategory()) return;

      const newId = crypto.randomUUID() as UUID;
      await create({ 
        id: newId,
        name: newCategoryName,
        description: newCategoryDescription
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setErrorMessage(null);
      setIsCreateDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      setErrorMessage('Terjadi kesalahan saat menyimpan kategori');
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      await update(selectedCategory.id, { 
        name: editCategoryName,
        description: editCategoryDescription 
      });
      setEditCategoryName('');
      setEditCategoryDescription('');
      setSelectedCategory(null);
      setIsEditDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorMessage('Terjadi kesalahan saat mengupdate kategori');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await remove(selectedCategory.id);
      setSelectedCategory(null);
      setIsDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage('Terjadi kesalahan saat menghapus kategori');
    }
  };

  if (loading) return <SkeletonCard/>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kategori Produk</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setNewCategoryName('');
            setNewCategoryDescription('');
            setErrorMessage(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Kategori</label>
                <Input
                  placeholder="Masukkan Nama Kategori"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setErrorMessage(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi Kategori</label>
                <Input
                  placeholder="Masukkan Deskripsi Kategori"
                  value={newCategoryDescription}
                  onChange={(e) => {
                    setNewCategoryDescription(e.target.value);
                    setErrorMessage(null);
                  }}
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
              <Button 
                onClick={handleCreate} 
                disabled={createLoading || !newCategoryName.trim()}
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
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead className="min-w-[150px]">Nama Kategori</TableHead>
                <TableHead className="min-w-[200px]">Deskripsi Kategori</TableHead>
                <TableHead className="min-w-[120px]">Tanggal Dibuat</TableHead>
                <TableHead className="w-[100px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.categories
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{category.description}</TableCell>
                  <TableCell>
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditCategoryName(category.name);
                          setEditCategoryDescription(category.description);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategory(category);
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
          setEditCategoryName('');
          setEditCategoryDescription('');
          setSelectedCategory(null);
          setErrorMessage(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kategori</label>
              <Input
                placeholder="Nama Kategori"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi Kategori</label>
              <Input
                placeholder="Deskripsi Kategori"
                value={editCategoryDescription}
                onChange={(e) => setEditCategoryDescription(e.target.value)}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            <Button 
              onClick={handleEdit} 
              disabled={updateLoading || !editCategoryName.trim()}
              className="w-full"
            >
              {updateLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setSelectedCategory(null);
          setErrorMessage(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus kategori "{selectedCategory?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
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
