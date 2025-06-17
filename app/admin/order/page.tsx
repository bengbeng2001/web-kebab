'use client';

import { useEffect, useState } from 'react';
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder, useCreateOrderProducts } from '@/lib/hooks/use-order';
import { Order, OrderProduct } from '@/lib/types/orders_interface';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Eye, Printer, X } from 'lucide-react';
import { SkeletonCard } from '@/components/skeleton';
import { createClient } from '@/lib/supabase/client';
import { Label } from '@/components/ui/label';
import { Product } from '@/lib/types/product_interface';
import { useProducts } from '@/lib/hooks/use-product';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function OrderPage() {
  const { data, loading, error, fetchOrders } = useOrders();
  const { create: createOrderCall, loading: createLoading, error: createError } = useCreateOrder();
  const { update: updateOrderCall, loading: updateLoading, error: updateError } = useUpdateOrder();
  const { remove, loading: deleteLoading, error: deleteError } = useDeleteOrder();
  const { create: createOrderProductsCall, loading: createOrderProductsLoading, error: createOrderProductsError } = useCreateOrderProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderType, setSelectedOrderType] = useState<string | undefined>(undefined);
  const itemsPerPage = 10;

  const dateFormatter = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderCashier, setNewOrderCashier] = useState('');
  const [newOrderType, setNewOrderType] = useState('');
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState('');
  const [newOrderPaymentAmount, setNewOrderPaymentAmount] = useState('');
  const [editOrderCashier, setEditOrderCashier] = useState('');
  const [editOrderType, setEditOrderType] = useState('');
  const [editOrderPaymentMethod, setEditOrderPaymentMethod] = useState('');
  const [editOrderPaymentAmount, setEditOrderPaymentAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [createdCustomerId, setCreatedCustomerId] = useState<UUID | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('pending');
  const [editOrderStatus, setEditOrderStatus] = useState('pending');
  const [editOrderPrintedAt, setEditOrderPrintedAt] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const { data: productsData, loading: productsLoading, error: productsError, fetchProducts } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<Omit<OrderProduct, 'id' | 'created_at'>[]>([]);
  const [isUserSelectDialogOpen, setIsUserSelectDialogOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const calculateCartTotals = () => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    return { totalItems, totalPrice };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (productsData?.products) {
      setProducts(productsData.products);
    }
  }, [productsData]);

  // Fetch users when dialog opens
  useEffect(() => {
    if (isUserSelectDialogOpen) {
      fetchUsers();
    }
  }, [isUserSelectDialogOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_public')
        .select('id, username, phone, address, role')
        .eq('role', 'customer')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Error fetching users');
    }
  };

  const handleUserSelect = (user: any) => {
    setNewCustomerName(user.username);
    setNewCustomerPhone(user.phone || '');
    setNewCustomerAddress(user.address || '');
    setCreatedCustomerId(user.id);
    setIsUserSelectDialogOpen(false);
  };

  // Mendapatkan kategori unik dari daftar produk
  const uniqueCategories = Array.from(new Set(productsData?.products.flatMap(p => p.categories || []).map(c => JSON.stringify(c))))
    .map(s => JSON.parse(s))
    .filter((cat: any) => cat.id && cat.name);

  const validateNewOrder = () => {
    if (!newCustomerName.trim()) {
      setErrorMessage('Nama customer harus diisi');
      return false;
    }
    if (!newCustomerPhone.trim()) {
      setErrorMessage('Nomor telepon customer harus diisi');
      return false;
    }
    if (!newCustomerAddress.trim()) {
      setErrorMessage('Alamat customer harus diisi');
      return false;
    }
    if (!newOrderCashier.trim()) {
      setErrorMessage('Nama kasir harus diisi');
      return false;
    }
    if (!newOrderType.trim()) {
      setErrorMessage('Tipe order harus diisi');
      return false;
    }
    if (!newOrderPaymentMethod.trim()) {
      setErrorMessage('Metode pembayaran harus diisi');
      return false;
    }
    if (!newOrderPaymentAmount.trim() || isNaN(parseInt(newOrderPaymentAmount)) || parseInt(newOrderPaymentAmount) <= 0) {
      setErrorMessage('Jumlah pembayaran harus berupa angka positif');
      return false;
    }
    if (cartItems.length === 0) {
      setErrorMessage('Pesanan harus memiliki setidaknya satu produk.');
      return false;
    }

    const { totalPrice: cartTotalPrice } = calculateCartTotals();
    const paymentAmount = parseInt(newOrderPaymentAmount);

    if (paymentAmount < cartTotalPrice) {
      setErrorMessage(`Jumlah pembayaran kurang dari total harga. Kekurangan: Rp. ${(cartTotalPrice - paymentAmount).toLocaleString('id-ID')}`);
      return false;
    }

    return true;
  };

  const validateEditOrder = () => {
    if (!editOrderStatus) {
      setErrorMessage('Status pesanan harus diisi');
      return false;
    }
    return true;
  };

  const handleAddProductToCart = () => {
    setErrorMessage(null);
    if (!selectedProduct || quantity <= 0) {
      setErrorMessage('Pilih produk dan masukkan kuantitas yang valid.');
      return;
    }

    const productToAdd = products.find(p => p.id === selectedProduct);
    if (!productToAdd || productToAdd.price === null || productToAdd.price === undefined || productToAdd.price < 0) {
      setErrorMessage('Produk tidak ditemukan atau harga tidak valid.');
      return;
    }

    const existingCartItemIndex = cartItems.findIndex(item => item.product_id === selectedProduct);
    let newQuantity = quantity;

    if (existingCartItemIndex > -1) {
      newQuantity += cartItems[existingCartItemIndex].quantity;
    }

    if (productToAdd.stock !== null && productToAdd.stock !== undefined && newQuantity > productToAdd.stock) {
      setErrorMessage(`Kuantitas untuk ${productToAdd.name} melebihi stok yang tersedia. Stok tersisa: ${productToAdd.stock}.`);
      return;
    }

    if (existingCartItemIndex > -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingCartItemIndex].quantity = newQuantity;
      updatedCartItems[existingCartItemIndex].subtotal = updatedCartItems[existingCartItemIndex].quantity * productToAdd.price;
      setCartItems(updatedCartItems);
    } else {
      setCartItems(prevItems => [
        ...prevItems,
        {
          order_id: '' as UUID,
          product_id: productToAdd.id,
          product_name: productToAdd.name,
          categories_id: productToAdd.categories && productToAdd.categories.length > 0 ? productToAdd.categories[0].id : '00000000-0000-0000-0000-000000000000',
          categories_name: productToAdd.categories && productToAdd.categories.length > 0 ? productToAdd.categories[0].name : 'Unknown Category',
          price: productToAdd.price,
          quantity: newQuantity,
          subtotal: newQuantity * productToAdd.price,
        },
      ]);
    }

    // Perbarui stok produk setelah ditambahkan ke keranjang
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productToAdd.id ? { ...p, stock: p.stock - quantity } : p
      )
    );

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveProductFromCart = (productId: string) => {
    const removedItem = cartItems.find(item => item.product_id === productId);
    if (removedItem) {
      // Kembalikan stok produk setelah dihapus dari keranjang
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === removedItem.product_id ? { ...p, stock: p.stock + removedItem.quantity } : p
        )
      );
    }
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  };

  const handleCreate = async () => {
    try {
      setErrorMessage(null);

      if (!validateNewOrder()) return;

      const paymentAmountValue = parseInt(newOrderPaymentAmount);
      const finalPaymentAmount = isNaN(paymentAmountValue) || paymentAmountValue < 0 ? 0 : paymentAmountValue;

      // Calculate totals from cart items
      const { totalItems, totalPrice } = calculateCartTotals();

      // Log the data we're about to send
      console.log('Creating order with data:', {
        order_number: Math.floor(Math.random() * 1000000),
        public_users_id: createdCustomerId,
        cashier: newOrderCashier,
        order_type: newOrderType,
        total_items: totalItems,
        total_price: totalPrice,
        payment_amount: finalPaymentAmount,
        income_amount: finalPaymentAmount,
        payment_method: newOrderPaymentMethod,
        status: newOrderStatus,
        printed_at: null,
        cartItems
      });

      const newOrderData = await createOrderCall({
        order_number: Math.floor(Math.random() * 1000000),
        public_users_id: createdCustomerId!,
        cashier: newOrderCashier,
        order_type: newOrderType,
        total_items: totalItems,
        total_price: totalPrice,
        payment_amount: finalPaymentAmount,
        income_amount: finalPaymentAmount,
        payment_method: newOrderPaymentMethod,
        status: newOrderStatus,
        printed_at: null
      });

      if (!newOrderData || !Array.isArray(newOrderData) || newOrderData.length === 0) {
        throw new Error('Failed to create order - no data returned');
      }

      const createdOrder = newOrderData[0] as Order;
      console.log('Order created successfully:', createdOrder);

      // Create order products
      if (cartItems.length > 0) {
        const orderProductsData = await createOrderProductsCall(
          cartItems.map(item => ({
            ...item,
            order_id: createdOrder.id
          }))
        );

        if (!orderProductsData) {
          throw new Error('Failed to create order products - no data returned');
        }

        console.log('Order products created successfully:', orderProductsData);
      }

      // Reset form
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerAddress('');
      setNewOrderCashier('');
      setNewOrderType('');
      setNewOrderPaymentMethod('');
      setNewOrderPaymentAmount('');
      setNewOrderStatus('pending');
      setCartItems([]);
      setCreatedCustomerId(null);
      setIsCreateDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Detailed error creating order:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error creating order');
    }
  };

  const handleEdit = async () => {
    try {
      setErrorMessage(null);
      if (!selectedOrder) return;

      if (!validateEditOrder()) return;

      const updatedFields: Partial<Order> = {
        status: editOrderStatus,
      };

      if (editOrderStatus === 'completed' && !selectedOrder.printed_at) {
        const now = new Date();
        updatedFields.printed_at = now.toISOString();
      } else if (editOrderPrintedAt) {
        const localDate = new Date(editOrderPrintedAt);
        updatedFields.printed_at = localDate.toISOString();
      }

      await updateOrderCall(selectedOrder.id, updatedFields);
      setIsEditDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      setErrorMessage(error.message || 'Gagal memperbarui pesanan');
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedOrder) return;
      await remove(selectedOrder.id);
      setIsDeleteDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      setErrorMessage(error.message || 'Gagal menghapus pesanan');
    }
  };

  const handlePrint = (orderToPrint: Order) => {
    const dateFormatter = new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const printContent = `
        <div style="max-width: 80mm; margin: 0 auto; background-color: white; color: black; padding: 16px;">
            <div style="text-align: center; margin-bottom: 16px;">
                <h1 style="font-size: 1.25rem; font-weight: bold;">Kebab Sayank</h1>
                <p style="font-size: 0.500rem;">Jl. Karang Menjangan No.75, Airlangga, Kec. Gubeng, Surabaya, Jawa Timur 60286</p>
            </div>

            <div style="font-size: 0.875rem; margin-bottom: 16px;">
                <p>No. Pesanan: #${orderToPrint.order_number}</p>
                <p>Nama Customer: ${orderToPrint.customer?.username || ''}</p>
                <p>No. Telp: ${orderToPrint.customer?.phone || ''}</p>
                <p>Alamat Customer: ${orderToPrint.customer?.address || ''}</p>
            </div>   

            <div style="font-size: 0.875rem; margin-bottom: 16px;">
                <p>Tanggal Cetak: ${dateFormatter.format(new Date(orderToPrint.created_at))}</p>
                <p>Kasir: ${orderToPrint.cashier}</p>
                <p>Tipe: ${orderToPrint.order_type}</p>
                <p>Metode Bayar: ${orderToPrint.payment_method}</p>
            </div>

            <div style="border-top: 1px dashed gray; border-bottom: 1px; padding-top: 8px; padding-bottom: 8px; margin-bottom: 16px;">
                <table style="width: 100%; font-size: 0.875rem;">
                    <thead>
                        <tr style="border-bottom: 1px dashed gray;">
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: right;">Qty</th>
                            <th style="text-align: right;">Harga</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderToPrint.order_products?.map(item => `
                            <tr style="border-bottom: 1px dashed gray;">
                                <td>${item.product_name}</td>
                                <td style="text-align: right;">${item.quantity}</td>
                                <td style="text-align: right;">Rp. ${(item.price || 0).toLocaleString('id-ID')}</td>
                                <td style="text-align: right;">Rp. ${(item.subtotal || 0).toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('') || ''}
                    </tbody>
                </table>
            </div>

            <div style="font-size: 0.875rem; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Total Produk:</span>
                    <span>${orderToPrint.total_items || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Total Harga:</span>
                    <span>Rp. ${(orderToPrint.total_price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Jumlah Bayar:</span>
                    <span>Rp. ${(orderToPrint.payment_amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Kembalian:</span>
                    <span>Rp. ${((orderToPrint.payment_amount || 0) - (orderToPrint.total_price || 0)).toLocaleString('id-ID')}</span>
                </div>
            </div>

            <div style="text-align: center; font-size: 0.875rem;">
                <p>Terima kasih atas kunjungan Anda <br> Bila Ada Kritik saran silahkan hubungi kami <br> 0858-2024-7769 (WhatsApp)</p>
            </div>
        </div>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Struk Pesanan</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
            body { font-family: sans-serif; margin: 0; }
            table { border-collapse: collapse; }
            th, td { padding: 4px; }
            @page { size: A5; margin: 0; }
        `);
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = selectedOrderType
    ? data?.orders.filter(order => order.order_type === selectedOrderType).slice(indexOfFirstItem, indexOfLastItem)
    : data?.orders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = selectedOrderType
    ? Math.ceil((data?.orders.filter(order => order.order_type === selectedOrderType).length || 0) / itemsPerPage)
    : Math.ceil((data?.orders.length || 0) / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.categories?.some(c => c.id === selectedCategory));

  const { totalItems, totalPrice } = calculateCartTotals();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Buat Pesanan
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {loading && <SkeletonCard />}

        {!loading && data?.orders && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Total Produk</TableHead>
                  <TableHead>Total Harga</TableHead>
                  <TableHead>Metode Bayar</TableHead>
                  <TableHead>Jumlah Pembayaran</TableHead>
                  <TableHead>Pesanan Dibuat</TableHead>
                  <TableHead>Pesanan Dicetak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders?.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">#{order.order_number}</TableCell>
                    <TableCell className="text-xs">{order.cashier}</TableCell>
                    <TableCell className="text-xs">{order.order_type}</TableCell>
                    <TableCell className="text-xs">{order.total_items}</TableCell>
                    <TableCell className="text-xs">Rp. {(order.total_price || 0).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-xs">{order.payment_method}</TableCell>
                    <TableCell className="text-xs">Rp. {(order.payment_amount || 0).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-xs">{dateFormatter.format(new Date(order.created_at))}</TableCell>
                    <TableCell className="text-xs">{order.printed_at ? dateFormatter.format(new Date(order.printed_at)) : 'Belum dicetak'}</TableCell>
                    <TableCell className="text-xs">
                      <span className={`px-2 py-1 rounded-lg font-medium text-white ${order.status === 'pending' ? 'bg-yellow-400' : order.status === 'completed' ? 'bg-green-700' : order.status === 'cancelled' ? 'bg-red-700' : ''}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {order.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(order)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
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
        )}

        <div className="flex items-center justify-between">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] h-[80vh]">
          <DialogHeader>
            <DialogTitle>Buat Pesanan Baru</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4 h-full overflow-y-auto">
            {errorMessage && (
              <div className="col-span-2 flex items-center justify-between bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{errorMessage}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setErrorMessage(null)}
                  className="ml-auto -mr-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Left Column - Customer & Order Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Informasi Customer</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerName">Nama Customer</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newCustomerName"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUserSelectDialogOpen(true)}
                      >
                        Select User
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerPhone">Nomor Telepon</Label>
                    <Input id="newCustomerPhone" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerAddress">Alamat</Label>
                    <Input id="newCustomerAddress" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Informasi Pesanan</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newOrderCashier">Kasir</Label>
                    <Input id="newOrderCashier" value={newOrderCashier} onChange={(e) => setNewOrderCashier(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newOrderType">Tipe Pesanan</Label>
                    <Select value={newOrderType} onValueChange={setNewOrderType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tipe Pesanan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dine In">Dine In</SelectItem>
                        <SelectItem value="Take Away">Take Away</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newOrderPaymentMethod">Metode Pembayaran</Label>
                    <Select value={newOrderPaymentMethod} onValueChange={setNewOrderPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Metode Pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="QRIS">QRIS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newOrderPaymentAmount">Jumlah Pembayaran</Label>
                    <Input
                      id="newOrderPaymentAmount"
                      type="number"
                      value={newOrderPaymentAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || isNaN(parseFloat(value))) {
                          setNewOrderPaymentAmount(''); // Biarkan kosong jika tidak valid
                          setErrorMessage('Jumlah pembayaran harus berupa angka valid.');
                        } else {
                          setNewOrderPaymentAmount(value);
                          setErrorMessage(null); // Hapus pesan error jika input valid
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newOrderStatus">Status</Label>
                    <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Selection & Cart */}
            <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Tambah Produk</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryFilter">Filter Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {uniqueCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productSelect">Pilih Produk</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id} disabled={p.price === null || p.price === undefined || p.price < 0}>
                            {p.name} {p.price === null || p.price === undefined || p.price < 0 ? '(Harga Tidak Valid)' : `(Rp. ${p.price.toLocaleString('id-ID')})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Kuantitas</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || isNaN(parseInt(value))) {
                          setQuantity(1); // Set default ke 1 atau nilai lain yang Anda inginkan
                          setErrorMessage('Kuantitas harus berupa angka valid.');
                        } else {
                          setQuantity(parseInt(value));
                          setErrorMessage(null); // Hapus pesan error jika input valid
                        }
                      }}
                      min="1"
                    />
                    {selectedProduct && products.find(p => p.id === selectedProduct) && (
                      <p className="text-sm text-muted-foreground">Stok Tersedia: {products.find(p => p.id === selectedProduct)?.stock}</p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddProductToCart} className="w-full">
                      Tambah ke Pesanan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cart Items Display */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Produk di Pesanan</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>Rp. {(item.price || 0).toLocaleString('id-ID')}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rp. {(item.subtotal || 0).toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveProductFromCart(item.product_id)}
                            >
                              Hapus
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end gap-4 font-bold">
                  <span>Total Produk: {totalItems || 0}</span>
                  <span>Total Harga: Rp. {(totalPrice || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setCartItems([]);
              setNewCustomerName('');
              setNewCustomerPhone('');
              setNewCustomerAddress('');
              setNewOrderCashier('');
              setNewOrderType('');
              setNewOrderPaymentMethod('');
              setNewOrderPaymentAmount('');
              setNewOrderStatus('pending');
              setSelectedProduct('');
              setQuantity(1);
              setErrorMessage(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading ? 'Membuat...' : 'Buat Pesanan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Pesanan #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Pesanan</Label>
                <Select
                  value={editOrderStatus}
                  onValueChange={setEditOrderStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="printed_at">Waktu Cetak</Label>
                <div className="flex gap-2">
                  <Input
                    id="printed_at"
                    type="datetime-local"
                    value={editOrderPrintedAt ? new Date(editOrderPrintedAt).toLocaleString('sv-SE').slice(0, 16) : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const [date, time] = value.split('T');
                        const [year, month, day] = date.split('-');
                        const [hours, minutes] = time.split(':');
                        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
                        setEditOrderPrintedAt(localDate.toISOString());
                      } else {
                        setEditOrderPrintedAt(null);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const now = new Date();
                      setEditOrderPrintedAt(now.toISOString());
                      setEditOrderStatus('completed');
                    }}
                  >
                    Sekarang
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditOrderStatus('pending');
              setEditOrderPrintedAt(null);
              setErrorMessage(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={updateLoading}>
              {updateLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pesanan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Anda yakin ingin menghapus pesanan #<span className="font-bold">{selectedOrder?.order_number}</span>?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p><b>Nama Customer:</b> {selectedOrder.customer?.username}</p>
                <p><b>Nomor Telepon:</b> {selectedOrder.customer?.phone}</p>
                <p><b>Alamat:</b> {selectedOrder.customer?.address}</p>
                <p><b>Kasir:</b> {selectedOrder.cashier}</p>
                <p><b>Tipe Pesanan:</b> {selectedOrder.order_type}</p>
                <p><b>Metode Bayar:</b> {selectedOrder.payment_method}</p>
                <p><b>Status:</b> {selectedOrder.status}</p>
                {selectedOrder.printed_at && <p><b>Dicetak pada:</b> {dateFormatter.format(new Date(selectedOrder.printed_at))}</p>}
              </div>

              <h4 className="text-lg font-semibold mt-4">Produk:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Kuantitas</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.order_products?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>Rp. {(item.price || 0).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rp. {(item.subtotal || 0).toLocaleString('id-ID')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end gap-4 mt-4 font-bold">
                <span>Total Produk: {selectedOrder.total_items || 0}</span>
                <span>Total Harga: Rp. {(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Selection Dialog */}
      <Dialog open={isUserSelectDialogOpen} onOpenChange={setIsUserSelectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchUsers();
              }}
            />
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.address || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserSelect(user)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
