'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/types/product_interface';
import { useProducts } from '@/lib/hooks/use-product';
import { useOrders, useCreateOrder, useCreateOrderProducts, useUpdateOrder, useDeleteOrder } from '@/lib/hooks/use-order';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UUID } from 'node:crypto';
// import { ScrollArea } from "@/components/ui/scroll-area";

const supabase = createClient();

interface CartItem {
  product_id: UUID;
  product_name: string;
  categories_id: UUID;
  categories_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function OrderPage() {
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newOrderCashier, setNewOrderCashier] = useState('annas');
  const [newOrderType, setNewOrderType] = useState('');
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState('');
  const [newOrderPaymentAmount, setNewOrderPaymentAmount] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('pending');
  
  // Cart states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // Hooks
  const { data: productsData, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { data: ordersData, loading: ordersLoading, error: ordersError, fetchOrders } = useOrders();
  const { create: createOrder, loading: createLoading, error: createError } = useCreateOrder();
  const { create: createOrderProducts, loading: createProductsLoading, error: createProductsError } = useCreateOrderProducts();
  
  // Get user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user details including address and phone_number from the updated 'users' table
        const { data: users, error: userDetailsError } = await supabase
          .from('users')
          .select('id, username, address, phone_number') // Select new columns
          .eq('id', user.id)
          .single();
        
        if (userDetailsError) {
          console.error("Error fetching user details:", userDetailsError);
        }

        if (users) {
          setNewCustomerName(users.username || ''); // Use username as customer name
          setNewCustomerAddress(users.address || '');
          setNewCustomerPhone(users.phone_number || '');
        }
      }
    };
    getUserData();
  }, []);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchOrders(),
          fetchProducts()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    initializeData();
  }, []); // Empty dependency array since we only want to fetch once on mount

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || 
        product.categories?.some(cat => cat.id === selectedCategory);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productsData?.products, selectedCategory, searchQuery]);

  // Get unique categories from products
  const categories = useMemo(() => {
    if (!productsData?.products) return [];
    const uniqueCategories = new Map();
    productsData.products.forEach(product => {
      product.categories?.forEach(category => {
        if (!uniqueCategories.has(category.id)) {
          uniqueCategories.set(category.id, category);
        }
      });
    });
    return Array.from(uniqueCategories.values());
  }, [productsData?.products]);

  // Calculate total
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [cartItems]);

  // Update payment amount when total changes
  useEffect(() => {
    setNewOrderPaymentAmount(total.toString());
  }, [total]);

  // Add product to cart
  const handleAddProductToCart = useCallback((product: Product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    const price = Number(product.price) || 0;
    
    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity + 1 > product.stock) {
        alert(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
        return;
      }
      
      setCartItems(prevItems => prevItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * price }
          : item
      ));
    } else {
      // Check if product has stock
      if (product.stock <= 0) {
        alert('Stok produk habis');
        return;
      }
      
      const newItem: CartItem = {
        product_id: product.id as UUID,
        product_name: product.name,
        categories_id: (product.categories?.[0]?.id || '') as UUID,
        categories_name: product.categories?.[0]?.name || '',
        price: price,
        quantity: 1,
        subtotal: price
      };
      setCartItems(prevItems => [...prevItems, newItem]);
    }
  }, [cartItems]);

  // Update cart item quantity
  const handleUpdateQuantity = useCallback((productId: UUID, change: number) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.product_id === productId) {
          let updatedQuantity = item.quantity; 

          if (change === -1) {
            // Decrement quantity, ensuring it doesn't go below 1
            updatedQuantity = Math.max(1, item.quantity - 1);
          } else if (change === 1) {
            // Increment quantity, with stock check
            const product = productsData?.products?.find(p => p.id === productId);
            if (product) {
              if (item.quantity + 1 > product.stock) {
                alert(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
                return item; // Return current item without modification if stock exceeded
              } else {
                updatedQuantity = item.quantity + 1;
              }
            } else {
              // Fallback: if product data not found, still increment
              updatedQuantity = item.quantity + 1;
            }
          }
          
          return {
            ...item,
            quantity: updatedQuantity,
            subtotal: updatedQuantity * item.price
          };
        }
        return item;
      });
    });
  }, [productsData?.products]);

  // Remove product from cart
  const handleRemoveProductFromCart = useCallback((productId: UUID) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  }, []);

  // Create order
  const handleCreate = async () => {
    try {
      setError(null);

      const calculatedTotalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      const parsedPaymentAmount = parseFloat(newOrderPaymentAmount) || 0;

      if (parsedPaymentAmount < calculatedTotalPrice) {
        alert(`Jumlah pembayaran (${parsedPaymentAmount.toLocaleString()}) lebih kecil dari total harga (${calculatedTotalPrice.toLocaleString()}). Mohon bayar sesuai jumlah.`);
        return;
      }

      // Get current user ID for customer_id
      const { data: { user }, error: userSessionError } = await supabase.auth.getUser();
      if (userSessionError || !user) {
        throw new Error("User not authenticated.");
      }
      const currentUserId = user.id;

      // No need to create a new customer entry in 'customers' table
      // The customer data is now directly associated with the user

      // Create order using hook
      const orderResult = await createOrder({
        order_number: Math.floor(Math.random() * 1000000),
        auth_id: currentUserId as UUID,
        cashier: newOrderCashier,
        order_type: newOrderType,
        total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total_price: calculatedTotalPrice,
        payment_amount: parsedPaymentAmount,
        income_amount: parsedPaymentAmount,
        payment_method: newOrderPaymentMethod,
        status: newOrderStatus,
        printed_at: null
      });

      // Create order products using hook
      await createOrderProducts(cartItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.product_id,
        product_name: item.product_name,
        categories_id: item.categories_id,
        categories_name: item.categories_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })));

      // Update product stock
      for (const item of cartItems) {
        const { data: currentProduct, error: productFetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (productFetchError) {
          console.error(`Error fetching stock for product ${item.product_name}:`, productFetchError);
          // Optionally, handle this error more gracefully, e.g., revert order
          continue; // Skip to next item if stock fetch fails
        }

        const newStock = (currentProduct?.stock || 0) - item.quantity;

        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);

        if (stockUpdateError) {
          console.error(`Error updating stock for product ${item.product_name}:`, stockUpdateError);
          // Optionally, handle this error more gracefully
        }
      }

      // Reset form
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
      setIsOrderDialogOpen(false);

      // Refresh orders
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };


  if (productsLoading || ordersLoading) return <div>Loading...</div>;
  if (productsError || ordersError) return <div>Error: {productsError || ordersError}</div>;

  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
              <CardDescription>Pilih menu yang ingin dipesan</CardDescription>
              <div className="flex gap-4 mt-4">
                <Input
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div>Loading products...</div>
              ) : productsError ? (
                <div>Error loading products: {productsError}</div>
              ) : filteredProducts.length === 0 ? (
                <div>No products found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {product.price && product.price > 0 
                                ? `Rp ${Number(product.price).toLocaleString()}` 
                                : 'Harga tidak tersedia'}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleAddProductToCart(product)}
                              disabled={!product.price || product.price <= 0}
                            >
                              {product.stock <= 0 ? 'Habis' : <Plus className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart and Order Form Section */}
        <div className="space-y-4">
          {/* Cart Card */}
          <Card>
            <CardHeader>
              <CardTitle>Keranjang</CardTitle>
              <CardDescription>Pesanan Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {Number(item.price || 0).toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.product_id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.product_id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                <Button
                  variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProductFromCart(item.product_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="w-full flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold">Rp {total.toLocaleString()}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Order Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Form Pesanan</CardTitle>
              <CardDescription>Lengkapi data pesanan Anda</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerName">Nama Customer</Label>
                    <Input
                      id="newCustomerName"
                      value={newCustomerName}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerPhone">Nomor Telepon</Label>
                    <Input
                      id="newCustomerPhone"
                      value={newCustomerPhone}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerAddress">Alamat</Label>
                    <Input
                      id="newCustomerAddress"
                      value={newCustomerAddress}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newOrderType">Tipe Pesanan</Label>
                    <Select value={newOrderType} onValueChange={setNewOrderType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tipe Pesanan" />
                      </SelectTrigger>
                      <SelectContent>
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
                      onChange={(e) => setNewOrderPaymentAmount(e.target.value)}
                    disabled
                    />
                  </div>
              </div>
            </CardContent>
            <CardFooter>
                            <Button
                className="w-full"
                onClick={handleCreate} 
                disabled={createLoading || createProductsLoading || !newCustomerName || !newCustomerPhone || !newCustomerAddress || !newOrderType || !newOrderPaymentMethod || !newOrderPaymentAmount || cartItems.length === 0}
              >
                {createLoading || createProductsLoading ? 'Membuat...' : 'Buat Pesanan'}
                            </Button>
            </CardFooter>
          </Card>
          </div>
        </div>
    </main>
  );
}
